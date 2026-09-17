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

  // Les chiffres d'usage s'écrivent à l'arrivée.
  //
  // Deux précautions. La note (« 5,0 ★ ») porte une étoile dans un <span> : on
  // n'anime que les <b> SANS élément enfant, sinon réécrire le texte
  // détruirait le balisage. Et en mouvement réduit on ne touche à rien : la
  // valeur finale est déjà dans le HTML, elle reste simplement affichée.
  // RÈGLE : une affirmation publique ne dépend jamais d'une animation.
  //
  // La première version calculait la valeur finale image par image. Une seule
  // image manquée — et la cadence peut être bridée — laissait « 0+ »
  // et « 0 M€+ » affichés. Sur le site d'un CIF, c'est un chiffre faux.
  //
  // D'où ces deux garde-fous : la chaîne d'origine est mémorisée et RÉÉCRITE
  // TELLE QUELLE à la fin (jamais reformatée, donc jamais « 100 » au lieu de
  // « 100+ »), et un filet de sécurité la rétablit quoi qu'il arrive.
  if(!reduit && typeof requestAnimationFrame==='function'){
    [].slice.call(document.querySelectorAll('.preuves b'))
      .filter(function(b){return !b.children.length;})
      .forEach(function(b){
        // NE JAMAIS RELIRE UN TEXTE QU'ON A SOI-MÊME MODIFIÉ.
        // demarrerPage() est appelée deux fois au premier chargement : tout de
        // suite, puis par « astro:page-load ». La version précédente relisait
        // b.textContent au second passage, y trouvait le « 0+ » posé par le
        // premier, et prenait ce zéro pour la valeur d'arrivée. Le filet de
        // sécurité rétablissait alors fidèlement… zéro. La valeur d'origine est
        // donc mémorisée, et c'est la seule source de vérité.
        if(!b.dataset.valeur) b.dataset.valeur=b.textContent;
        var fin=b.dataset.valeur;
        if(b.dataset.compte==='1') return;          // une seule animation par élément
        var m=fin.trim().match(/^(\d+(?:[.,]\d+)?)([\s\S]*)$/);
        if(!m) return;
        b.dataset.compte='1';
        var cible=parseFloat(m[1].replace(',','.')), suffixe=m[2], depart=null, arrive=false;
        var poser=function(){ if(!arrive){ arrive=true; b.textContent=fin; b.dataset.compte='0'; } };
        b.textContent='0'+suffixe;
        setTimeout(poser,1100);                    // filet : la valeur est écrite même sans animation
        var pas=function(t){
          if(arrive) return;
          if(depart===null) depart=t;
          var p=Math.min(1,(t-depart)/900);
          if(p>=1){ poser(); return; }
          var v=cible*(1-Math.pow(1-p,3));         // départ franc, arrivée douce
          b.textContent=(Number.isInteger(cible)?Math.round(v).toLocaleString('fr-FR'):v.toFixed(1).replace('.',','))+suffixe;
          requestAnimationFrame(pas);
        };
        requestAnimationFrame(pas);
      });
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
