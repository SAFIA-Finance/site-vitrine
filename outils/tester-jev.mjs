// Test de connexion à Jev, le modèle d'évaluation de TypeSafe AI.
//
// Ne juge rien du site : vérifie seulement que la clé est valide, que la
// passerelle de Vercel répond et que la facturation passe. À lancer avant
// tout audit, et le jour où un audit échoue sans raison claire.
//
// Un test avec un modèle de texte classique ne prouverait rien ici : Jev
// passe par un autre fournisseur et par une autre modalité (« evaluation »,
// et non « generateText »). C'est donc ce chemin précis qu'on teste.
//
// Usage : npm run tester-jev
import fs from 'node:fs';
import path from 'node:path';
import { experimental_evaluate as evaluer } from 'ai';

// La clé vit dans « .env.local », jamais dans le dépôt : il est public.
// Lecture à la main plutôt que « --env-file », qui demande Node 20.6 quand le
// projet n'exige que 20.3.
const FICHIER_ENV = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(FICHIER_ENV)) {
  console.error("Fichier « .env.local » absent. La clé de l'AI Gateway doit y figurer.");
  process.exit(1);
}
for (const ligne of fs.readFileSync(FICHIER_ENV, 'utf8').split(/\r?\n/)) {
  const trouve = ligne.match(/^([A-Z0-9_]+)=(.*)$/);
  if (trouve) process.env[trouve[1]] ??= trouve[2].trim();
}

if (!process.env.AI_GATEWAY_API_KEY) {
  console.error('AI_GATEWAY_API_KEY introuvable dans « .env.local ».');
  process.exit(1);
}

// Un extrait réel du blog plutôt qu'une phrase inventée : on veut savoir si le
// modèle se comporte correctement sur de la prose fiscale française, qui est
// la seule matière qu'on lui donnera jamais.
const EXTRAIT =
  "L'abattement annuel de 4 600 € ne s'applique qu'à l'impôt sur le revenu. " +
  'Les 17,2 % de prélèvements sociaux restent dus sur la totalité des gains.';

const debut = Date.now();

// Les erreurs de la passerelle remontent par défaut en trace d'appels de
// quarante lignes, illisible pour qui n'écrit pas de code. Les trois causes
// réelles sont toujours les mêmes : pas de carte enregistrée, clé refusée, ou
// plus de crédit. On les nomme.
let resultat;
try {
  resultat = await evaluer({
    model: 'typesafe-ai/jev',
    state: EXTRAIT,
    questions: {
      // Une question dont la réponse est évidente : si elle tombe à côté, le
      // problème est le modèle ou le routage, pas notre rédaction.
      fiscaliteFrancaise: {
        type: 'boolean',
        instructions: 'Ce texte traite-t-il de fiscalité française ?',
      },
      // Une question de nuance, pour voir si la calibration tient sur un point
      // que le texte dit explicitement.
      prelevementsSociauxDus: {
        type: 'boolean',
        instructions:
          "Le texte affirme-t-il que les prélèvements sociaux restent dus malgré l'abattement ?",
      },
    },
  });
} catch (erreur) {
  const message = String(erreur?.cause?.data?.error?.message ?? erreur?.message ?? erreur);
  const type = erreur?.cause?.data?.error?.type;
  const lignes = [];
  if (type === 'customer_verification_required' || /credit card/i.test(message)) {
    lignes.push("La clé est valide, mais le compte Vercel n'a aucune carte enregistrée.");
    lignes.push("L'AI Gateway refuse toute requête tant qu'il n'y en a pas, y compris");
    lignes.push('pour consommer les crédits offerts.');
    lignes.push('À régler sur vercel.com, rubrique AI Gateway.');
  } else if (/api key|unauthorized|401/i.test(message)) {
    lignes.push('Clé refusée. Vérifier « AI_GATEWAY_API_KEY » dans « .env.local ».');
  } else {
    lignes.push(`Échec de l'appel à Jev : ${message}`);
  }
  console.error(lignes.join('\n'));
  process.exit(1);
}

const ms = Date.now() - debut;

if (resultat) {
  console.log(`Réponse en ${ms} ms.`);
  console.log(
    `  fiscaliteFrancaise     : ${resultat.answers.fiscaliteFrancaise.probability.toFixed(3)}  (attendu : proche de 1)`,
  );
  console.log(
    `  prelevementsSociauxDus : ${resultat.answers.prelevementsSociauxDus.probability.toFixed(3)}  (attendu : proche de 1)`,
  );

  // Le coût réel se compte en millionièmes de dollar : huit décimales, sinon
  // l'appel s'affiche à zéro et on ne sait plus si la facturation fonctionne.
  const cout = Number(resultat.providerMetadata?.gateway?.cost ?? 0);
  console.log(`  coût de cet appel      : ${cout.toFixed(8)} $`);

  const ok =
    resultat.answers.fiscaliteFrancaise.probability > 0.8 &&
    resultat.answers.prelevementsSociauxDus.probability > 0.8;

  console.log(
    ok
      ? '\nConnexion à Jev opérationnelle.'
      : '\nLa passerelle répond, mais les réponses sont fausses. À creuser avant tout audit.',
  );
  process.exitCode = ok ? 0 : 1;
}
