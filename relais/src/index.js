// Relais entre les formulaires du site et Brevo.
//
// Le site est statique et public : une clé API Brevo placée dans son code serait
// lisible par n'importe qui. Ce Worker Cloudflare garde la clé côté serveur et
// n'expose que trois actions, limitées aux origines du site.
//
//   POST /newsletter  { email, source }                         → liste newsletter
//   POST /demo        { nom, structure, email, fonction?,
//                       clients?, message?, source }             → liste démo + e-mail d'alerte
//   POST /contact     { nom, email, sujet, message, source }     → e-mail d'alerte SEULEMENT
//
// La différence entre /demo et /contact n'est pas de forme, elle est de fond :
// une demande de démo est une piste commerciale, qui a sa place dans une liste
// Brevo ; un message de support ne l'est pas. L'inscrire dans une liste
// reviendrait à transformer « j'ai un souci avec mon compte » en consentement
// commercial. /contact n'écrit donc dans aucune liste et ne fait qu'alerter.
//
// Le champ « site » est un pot de miel : invisible pour un humain, rempli par les robots.

const BREVO = 'https://api.brevo.com/v3';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default {
  async fetch(request, env) {
    const origines = env.ORIGINES.split(',').map((o) => o.trim());
    const origine = request.headers.get('Origin') ?? '';
    const cors = {
      'Access-Control-Allow-Origin': origines.includes(origine) ? origine : origines[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return repondre({ erreur: 'methode' }, 405, cors);
    if (!origines.includes(origine)) return repondre({ erreur: 'origine' }, 403, cors);

    if (env.LIMITE) {
      const ip = request.headers.get('CF-Connecting-IP') ?? 'inconnue';
      const { success } = await env.LIMITE.limit({ key: ip });
      if (!success) return repondre({ erreur: 'trop-de-demandes' }, 429, cors);
    }

    let donnees;
    try {
      donnees = await request.json();
    } catch {
      return repondre({ erreur: 'illisible' }, 400, cors);
    }

    // Un robot a rempli le champ caché : on fait comme si tout allait bien.
    if (donnees.site) return repondre({ ok: true }, 200, cors);

    const chemin = new URL(request.url).pathname;
    try {
      if (chemin === '/newsletter') return await newsletter(donnees, env, cors);
      if (chemin === '/demo') return await demo(donnees, env, cors);
      if (chemin === '/contact') return await contact(donnees, env, cors);
      return repondre({ erreur: 'inconnu' }, 404, cors);
    } catch (e) {
      console.error(chemin, e.message);
      return repondre({ erreur: 'service' }, 502, cors);
    }
  },
};

async function newsletter(d, env, cors) {
  const email = texte(d.email, 254).toLowerCase();
  if (!EMAIL.test(email)) return repondre({ erreur: 'email' }, 422, cors);

  await brevo(env, '/contacts', {
    email,
    listIds: [Number(env.LISTE_NEWSLETTER)],
    updateEnabled: true,
    attributes: { SAFIA_ORIGINE: texte(d.source, 60) || 'site' },
  });

  return repondre({ ok: true }, 200, cors);
}

async function demo(d, env, cors) {
  const demande = {
    nom: texte(d.nom, 120),
    structure: texte(d.structure, 160),
    email: texte(d.email, 254).toLowerCase(),
    fonction: texte(d.fonction, 120),
    clients: texte(d.clients, 40),
    message: texte(d.message, 2000),
    source: texte(d.source, 60) || 'site',
  };

  if (!demande.nom || !demande.structure) return repondre({ erreur: 'champs' }, 422, cors);
  if (!EMAIL.test(demande.email)) return repondre({ erreur: 'email' }, 422, cors);

  await brevo(env, '/contacts', {
    email: demande.email,
    listIds: [Number(env.LISTE_DEMO)],
    updateEnabled: true,
    attributes: {
      SAFIA_NOM: demande.nom,
      SAFIA_STRUCTURE: demande.structure,
      SAFIA_FONCTION: demande.fonction,
      SAFIA_CLIENTS: demande.clients,
      SAFIA_MESSAGE: demande.message,
      SAFIA_ORIGINE: demande.source,
    },
  });

  const lignes = [
    ['Page', demande.source],
    ['Nom', demande.nom],
    ['Structure', demande.structure],
    ['Fonction', demande.fonction],
    ['Clients suivis', demande.clients],
    ['Email', demande.email],
    ['Contexte', demande.message],
  ].filter(([, v]) => v);

  await brevo(env, '/smtp/email', {
    sender: { email: env.EXPEDITEUR_EMAIL, name: 'Site SAFIA' },
    to: [{ email: env.ALERTE_EMAIL }],
    replyTo: { email: demande.email, name: demande.nom },
    subject: `Demande de démo · ${demande.structure}`,
    htmlContent:
      '<p>Nouvelle demande reçue depuis le site.</p><table cellpadding="6">' +
      lignes.map(([k, v]) => `<tr><td><b>${echapper(k)}</b></td><td>${echapper(v)}</td></tr>`).join('') +
      '</table><p>Répondre à cet e-mail écrit directement au demandeur.</p>',
  });

  return repondre({ ok: true }, 200, cors);
}

async function contact(d, env, cors) {
  const demande = {
    // Nom et sujet finissent dans l'objet et le « répondre à » du courriel :
    // on les ramène sur une ligne, un retour chariot n'ayant rien à y faire.
    nom: texte(d.nom, 120).replace(/\s+/g, ' '),
    email: texte(d.email, 254).toLowerCase(),
    sujet: texte(d.sujet, 80).replace(/\s+/g, ' ') || 'Message',
    message: texte(d.message, 4000),
    source: texte(d.source, 60) || 'site',
  };

  if (!demande.nom || !demande.message) return repondre({ erreur: 'champs' }, 422, cors);
  if (!EMAIL.test(demande.email)) return repondre({ erreur: 'email' }, 422, cors);

  const lignes = [
    ['Page', demande.source],
    ['Nom', demande.nom],
    ['Email', demande.email],
    ['Sujet', demande.sujet],
  ];

  await brevo(env, '/smtp/email', {
    sender: { email: env.EXPEDITEUR_EMAIL, name: 'Site SAFIA' },
    to: [{ email: env.ALERTE_EMAIL }],
    replyTo: { email: demande.email, name: demande.nom },
    subject: `Contact · ${demande.sujet}`,
    htmlContent:
      '<p>Message reçu depuis le formulaire de contact.</p><table cellpadding="6">' +
      lignes.map(([k, v]) => `<tr><td><b>${echapper(k)}</b></td><td>${echapper(v)}</td></tr>`).join('') +
      `</table><p><b>Message</b></p><p>${echapper(demande.message).replace(/\n/g, '<br>')}</p>` +
      '<p>Répondre à cet e-mail écrit directement à l\'expéditeur.</p>',
  });

  return repondre({ ok: true }, 200, cors);
}

async function brevo(env, chemin, corps) {
  const r = await fetch(BREVO + chemin, {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(corps),
  });
  // 201 : créé, 204 : contact existant mis à jour.
  if (!r.ok) throw new Error(`Brevo ${chemin} ${r.status} ${await r.text()}`);
}

function texte(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function echapper(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function repondre(corps, statut, entetes) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { ...entetes, 'Content-Type': 'application/json; charset=utf-8' },
  });
}
