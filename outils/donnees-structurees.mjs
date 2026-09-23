// Contrôle les données structurées de toutes les pages construites.
//
// Les données structurées sont le bloc JSON caché dans chaque page qui dit à
// Google « ceci est un article, voici son auteur et sa date », « ceci est une
// FAQ, voici les questions ». C'est ce qui permet à une page d'apparaître
// autrement qu'en deux lignes grises, et c'est aussi ce que les assistants
// d'IA lisent en premier parce que c'est la partie non ambiguë d'une page.
//
// POURQUOI CET OUTIL PLUTÔT QUE LE TEST DE GOOGLE. Le test des résultats
// enrichis vérifie UNE adresse à la fois, dans un navigateur, et ne garde
// aucune trace. Le site en compte 180. Ce script les contrôle toutes en
// quelques secondes, à chaque construction si on le veut, et il échoue avec un
// code non nul : une erreur de données structurées ne peut donc plus passer
// inaperçue. Il ne remplace pas le test de Google, qui seul dit ce que Google
// accepte vraiment ce jour-là ; il évite d'y aller pour rien.
//
// Usage : npm run donnees-structurees
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.join(process.cwd(), 'dist');

/** Ce que chaque type doit porter pour être exploitable, et par qui. */
const EXIGENCES = {
  BlogPosting: {
    obligatoires: ['headline', 'datePublished', 'author'],
    recommandes: ['dateModified', 'image', 'publisher', 'description'],
  },
  FAQPage: { obligatoires: ['mainEntity'], recommandes: [] },
  BreadcrumbList: { obligatoires: ['itemListElement'], recommandes: [] },
  Organization: { obligatoires: ['name', 'url'], recommandes: ['logo', 'sameAs'] },
  WebSite: { obligatoires: ['name', 'url'], recommandes: [] },
  Person: { obligatoires: ['name'], recommandes: ['url'] },
  MobileApplication: {
    obligatoires: ['name', 'applicationCategory'],
    recommandes: ['operatingSystem', 'offers'],
  },
  WebPage: { obligatoires: ['name'], recommandes: [] },
};

// Google tronque un « headline » au-delà de 110 caractères.
const LIMITE_HEADLINE = 110;

const pages = [];
(function parcourir(dossier) {
  for (const e of fs.readdirSync(dossier, { withFileTypes: true })) {
    const p = path.join(dossier, e.name);
    if (e.isDirectory()) parcourir(p);
    else if (e.name.endsWith('.html')) pages.push(p);
  }
})(DIST);

const anomalies = [];
const compteurs = new Map();
let blocs = 0;

/** Déplie « @graph » et les tableaux : un bloc peut contenir plusieurs objets. */
function aplatir(objet) {
  if (Array.isArray(objet)) return objet.flatMap(aplatir);
  if (objet && typeof objet === 'object') {
    if (Array.isArray(objet['@graph'])) return objet['@graph'].flatMap(aplatir);
    return [objet];
  }
  return [];
}

for (const fichier of pages) {
  const route = '/' + path.relative(DIST, fichier).replace(/\\/g, '/').replace(/index\.html$/, '');
  const html = fs.readFileSync(fichier, 'utf8');
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];

  // Les pages de redirection produites par Astro n'ont qu'un « meta refresh »
  // et un « noindex ». Elles n'ont ni contenu ni raison d'être décrites, et
  // les compter en faute noierait de vraies erreurs sous deux fausses.
  if (/<meta http-equiv="refresh"/i.test(html)) continue;

  if (!scripts.length) {
    anomalies.push({ route, gravite: 'ERREUR', quoi: 'aucune donnée structurée' });
    continue;
  }

  for (const s of scripts) {
    blocs++;
    let donnees;
    try {
      donnees = JSON.parse(s[1]);
    } catch (e) {
      // Le cas le plus grave : Google ignore le bloc entier en silence.
      anomalies.push({ route, gravite: 'ERREUR', quoi: `JSON invalide (${e.message})` });
      continue;
    }

    for (const objet of aplatir(donnees)) {
      const type = objet['@type'];
      if (!type) {
        anomalies.push({ route, gravite: 'ERREUR', quoi: 'objet sans « @type »' });
        continue;
      }
      const types = Array.isArray(type) ? type : [type];
      for (const t of types) compteurs.set(t, (compteurs.get(t) ?? 0) + 1);

      for (const t of types) {
        const regle = EXIGENCES[t];
        if (!regle) continue;

        for (const champ of regle.obligatoires) {
          if (objet[champ] === undefined || objet[champ] === '') {
            anomalies.push({ route, gravite: 'ERREUR', quoi: `${t} sans « ${champ} »` });
          }
        }
        for (const champ of regle.recommandes) {
          if (objet[champ] === undefined || objet[champ] === '') {
            anomalies.push({ route, gravite: 'avis', quoi: `${t} sans « ${champ} »` });
          }
        }
      }

      if (types.includes('BlogPosting') && typeof objet.headline === 'string') {
        if (objet.headline.length > LIMITE_HEADLINE) {
          anomalies.push({
            route,
            gravite: 'ERREUR',
            quoi: `headline de ${objet.headline.length} caractères, limite ${LIMITE_HEADLINE}`,
          });
        }
      }

      if (types.includes('FAQPage')) {
        const questions = Array.isArray(objet.mainEntity) ? objet.mainEntity : [];
        if (!questions.length) {
          anomalies.push({ route, gravite: 'ERREUR', quoi: 'FAQPage sans question' });
        }
        for (const q of questions) {
          if (!q.name) anomalies.push({ route, gravite: 'ERREUR', quoi: 'Question sans « name »' });
          const r = q.acceptedAnswer;
          if (!r || !r.text) {
            anomalies.push({ route, gravite: 'ERREUR', quoi: `réponse vide pour « ${q.name ?? '?'} »` });
          }
        }
      }

      if (types.includes('BreadcrumbList')) {
        const items = Array.isArray(objet.itemListElement) ? objet.itemListElement : [];
        if (!items.length) {
          anomalies.push({ route, gravite: 'ERREUR', quoi: 'BreadcrumbList vide' });
        }
        items.forEach((it, i) => {
          if (it.position !== i + 1) {
            anomalies.push({
              route,
              gravite: 'ERREUR',
              quoi: `fil d'Ariane : position ${it.position} au rang ${i + 1}`,
            });
          }
          if (!it.name) anomalies.push({ route, gravite: 'ERREUR', quoi: "fil d'Ariane sans « name »" });
        });
      }

      // Une note agrégée sans son effectif est refusée par Google, et une note
      // que le site s'attribue à lui-même est une raison de sanction. Celle de
      // SAFIA vient des magasins : elle doit dire combien d'avis la fondent.
      if (objet.aggregateRating) {
        const n = objet.aggregateRating.ratingCount ?? objet.aggregateRating.reviewCount;
        if (!n) {
          anomalies.push({
            route,
            gravite: 'ERREUR',
            quoi: 'aggregateRating sans « ratingCount » ni « reviewCount »',
          });
        }
      }

      // Une date d'article postérieure au jour de la construction se voit,
      // et fait douter de toutes les autres.
      for (const champ of ['datePublished', 'dateModified']) {
        const v = objet[champ];
        if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) {
          if (new Date(v) > new Date(Date.now() + 86400000)) {
            anomalies.push({ route, gravite: 'ERREUR', quoi: `${champ} dans le futur : ${v}` });
          }
        }
      }
    }
  }
}

console.log(`${pages.length} pages, ${blocs} bloc(s) de données structurées.\n`);

console.log('Types rencontrés');
for (const [t, n] of [...compteurs].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${t}`);
}

const erreurs = anomalies.filter((a) => a.gravite === 'ERREUR');
const avis = anomalies.filter((a) => a.gravite === 'avis');

/** Une même anomalie sur 132 articles ne doit pas produire 132 lignes. */
function grouper(liste) {
  const m = new Map();
  for (const a of liste) {
    if (!m.has(a.quoi)) m.set(a.quoi, []);
    m.get(a.quoi).push(a.route);
  }
  return [...m].sort((x, y) => y[1].length - x[1].length);
}

if (erreurs.length) {
  console.log(`\nERREURS (${erreurs.length})`);
  for (const [quoi, routes] of grouper(erreurs)) {
    console.log(`  ${quoi} — ${routes.length} page(s)`);
    for (const r of routes.slice(0, 5)) console.log(`      ${r}`);
    if (routes.length > 5) console.log(`      … et ${routes.length - 5} autre(s)`);
  }
} else {
  console.log('\nAucune erreur.');
}

if (avis.length) {
  console.log(`\nChamps recommandés absents (${avis.length}) — sans gravité, mais ils enrichissent l'affichage`);
  for (const [quoi, routes] of grouper(avis)) {
    console.log(`  ${quoi} — ${routes.length} page(s)`);
  }
}

if (erreurs.length) process.exitCode = 1;
