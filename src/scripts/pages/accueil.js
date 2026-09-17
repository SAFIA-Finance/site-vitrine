import { envoyer, emailValide } from '../formulaires.js';

// Rejoue apres chaque navigation sans rechargement : les transitions de page
// remplacent le corps du document, et tout ecouteur pose sur un element part
// avec lui. Le corps n'est volontairement pas reindente — ces fichiers
// contiennent des chaines litterales multilignes.
const CHEMIN_PAGE = location.pathname;
function demarrerPage() {
  // Ce script n'appartient qu'a cette page : on ne le rejoue que lorsqu'on y
  // revient. Sans cette garde, il s'executerait sur toutes les autres.
  if (location.pathname !== CHEMIN_PAGE) return;

(function(){
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Séquence d'ouverture de la conversation (un seul moment animé)
  var el = function(i){return document.querySelector('[data-seq="'+i+'"]');};
  if(reduit){
    el(1).style.display='none'; document.querySelectorAll('[data-seq="0"],[data-seq="2"]').forEach(function(x){x.classList.add('vu');});
  } else {
    setTimeout(function(){document.querySelectorAll('[data-seq="0"]').forEach(function(x){x.classList.add('vu');});},500);
    setTimeout(function(){el(1).classList.add('vu');},1200);
    setTimeout(function(){el(1).style.display='none';document.querySelectorAll('[data-seq="2"]').forEach(function(x){x.classList.add('vu');});},2600);
  }

  // Mensuel / Annuel
  var boutons=document.querySelectorAll('.bascule button');
  var prix=document.getElementById('prix'), periode=document.getElementById('periode'), equiv=document.getElementById('equiv'), conseiller=document.getElementById('conseiller');
  boutons.forEach(function(b){
    b.addEventListener('click',function(){
      boutons.forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});
      var annuel=b.dataset.periode==='annuel';
      // Le chiffre mis en avant est toujours mensuel : c'est celui auquel un
      // visiteur compare son budget. Le total annuel reste affiché dessous.
      prix.textContent=annuel?'24,92 €':'29,99 €';
      periode.textContent='par mois';
      equiv.textContent=annuel?'Facturé 299 € par an, soit 2 mois offerts':'Sans conseiller. Passe à l’annuel pour l’ajouter.';
      conseiller.hidden=!annuel;
    });
  });

  // Newsletter : inscription dans Brevo, via le relais
  var nl=document.getElementById('nl');
  nl.addEventListener('submit',async function(e){
    e.preventDefault();
    var email=document.getElementById('email'), c=document.getElementById('confirm'), bouton=nl.querySelector('button[type="submit"]');
    c.hidden=false;
    if(!emailValide(email.value)){c.style.color='#FFD1DC';c.textContent='Saisis une adresse email valide, par exemple ton@email.fr.';email.focus();return;}
    bouton.disabled=true; c.style.color=''; c.textContent='Inscription en cours…';
    try{
      await envoyer('newsletter',{email:email.value, site:nl.elements.site.value});
      c.textContent='Inscription enregistrée. Premier email bientôt.'; email.value='';
    }catch(err){
      c.style.color='#FFD1DC'; c.textContent=err.message;
    }finally{
      bouton.disabled=false;
    }
  });
})();
}

demarrerPage();
document.addEventListener('astro:page-load', demarrerPage);
