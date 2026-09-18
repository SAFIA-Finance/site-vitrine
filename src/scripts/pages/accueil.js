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

  // Séquence de la conversation : la question, l'attente, la réponse, puis les
  // sources. Quatre temps, rejoués trois fois, puis repos sur l'état final.
  //
  // Pourquoi pas une boucle sans fin : une animation perpétuelle dans un hero
  // détourne l'œil des deux boutons, qui sont ce qui fait télécharger. Trois
  // passages suffisent à ce qu'un visiteur arrivé en cours de route comprenne.
  //
  // Les sources ont leur propre temps, en dernier : c'est le différenciateur de
  // SAFIA, il est mis en scène plutôt que noyé au bas de la bulle.
  var tous = function(i){return [].slice.call(document.querySelectorAll('[data-seq="'+i+'"]'));};
  var frappe = document.querySelector('.frappe');

  if(reduit){
    // Tout est là d'emblée, et l'indicateur de frappe n'a plus lieu d'être.
    if(frappe) frappe.style.display='none';
    [0,2,3].forEach(function(i){tous(i).forEach(function(x){x.classList.add('vu');});});
  } else {
    // demarrerPage() est appelée deux fois au premier chargement : sans ce
    // garde-fou, deux séquences se superposeraient et les minuteries
    // s'empileraient — c'est exactement ce qui avait faussé les compteurs.
    var scene = document.querySelector('.conv-app');
    if(scene && !scene.dataset.joue){
      scene.dataset.joue='1';
      var minuteries=[];
      var TEMPS=[[0,500],[1,1300],[2,2700],[3,3600]];   // question, frappe, réponse, sources
      var REPOS=4200, CYCLES=3;

      var reinitialiser=function(){
        [0,2,3].forEach(function(i){tous(i).forEach(function(x){x.classList.remove('vu');});});
        if(frappe){frappe.style.display=''; frappe.classList.remove('vu');}
      };
      var jouer=function(cycle){
        TEMPS.forEach(function(t){
          minuteries.push(setTimeout(function(){
            if(t[0]===1){ if(frappe) frappe.classList.add('vu'); return; }
            if(t[0]===2 && frappe) frappe.style.display='none';
            tous(t[0]).forEach(function(x){x.classList.add('vu');});
          },t[1]));
        });
        if(cycle+1<CYCLES){
          minuteries.push(setTimeout(function(){reinitialiser();jouer(cycle+1);},TEMPS[3][1]+REPOS));
        }
      };
      jouer(0);

      // Une navigation sans rechargement remplace le DOM : les minuteries
      // encore en vol viseraient des éléments disparus.
      document.addEventListener('astro:before-swap',function(){
        minuteries.forEach(clearTimeout);
      },{once:true});
    }
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

        // DEUX FAÇONS DE CONNAÎTRE LA VALEUR D'ARRIVÉE.
        //
        // Par défaut elle est LUE dans le texte affiché : « 100+ » donne 100,
        // et le compteur écrit un, puis deux, puis trois chiffres. L'effet de
        // masse vient de là, du nombre qui s'allonge.
        //
        // Mais « 10 M€+ » ne donne que 10 : deux caractères qui ne bougent pas
        // en largeur, alors que c'est le chiffre le plus impressionnant des
        // trois. D'où « data-vers », qui porte la valeur réelle à faire défiler
        // quand le texte affiché est un ordre de grandeur abrégé.
        //
        // L'AFFICHAGE RESTE LA CHAÎNE D'ORIGINE : on anime 10 000 000, on
        // publie « 10 M€+ ». Le « + » veut dire « plus de », et le retirer
        // transformerait un ordre de grandeur en montant exact annoncé par un
        // conseiller en investissements financiers.
        var vers=parseFloat(b.dataset.vers||'');
        var etendu=!isNaN(vers)&&vers>0;
        var cible, suffixe;
        if(etendu){
          cible=vers;
          suffixe=b.dataset.unite||'';
        } else {
          var m=fin.trim().match(/^(\d+(?:[.,]\d+)?)([\s\S]*)$/);
          if(!m) return;
          cible=parseFloat(m[1].replace(',','.'));
          suffixe=m[2];
        }

        b.dataset.compte='1';
        var depart=null, arrive=false;
        // Traverser sept ordres de grandeur demande plus de temps que d'en
        // traverser trois. LE FILET SUIT LA DURÉE : laissé à 1 100 ms, il
        // poserait la valeur finale avant la fin et couperait l'animation.
        var DUREE=etendu?1400:900;
        var poser=function(){ if(!arrive){ arrive=true; b.textContent=fin; b.dataset.compte='0'; } };
        b.textContent='0'+suffixe;
        setTimeout(poser,DUREE+200);               // filet : la valeur est écrite même sans animation
        var pas=function(t){
          if(arrive) return;
          if(depart===null) depart=t;
          var p=Math.min(1,(t-depart)/DUREE);
          if(p>=1){ poser(); return; }
          var v;
          if(etendu){
            // Progression EXPONENTIELLE, et c'est tout l'effet recherché : à
            // vitesse constante sur les puissances de dix, le nombre gagne un
            // chiffre à intervalle régulier — 1, 10, 100, 1 000, et ainsi de
            // suite. Une progression linéaire, elle, atteindrait les millions
            // dès les premières images et ne montrerait aucune accumulation.
            v=Math.pow(10,p*Math.log(cible)/Math.LN10);
          } else {
            v=cible*(1-Math.pow(1-p,3));           // départ franc, arrivée douce
          }
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
