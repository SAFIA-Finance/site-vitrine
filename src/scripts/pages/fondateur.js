
// Prise de rendez-vous : le calendrier Calendly, charge A LA DEMANDE.
//
// POURQUOI PAS A L'OUVERTURE DE LA PAGE. Le script de Calendly depose des
// cookies tiers. Le bandeau du site ne demande d'accord que pour la mesure
// d'audience : s'en servir pour charger Calendly donnerait un consentement ni
// specifique ni eclaire, et rendrait fausse la promesse « tu peux refuser sans
// consequence », puisqu'un refus empecherait alors de prendre rendez-vous.
// Le clic du visiteur vaut accord pour cette seule finalite, et lui seul.
//
// Rejoue apres chaque navigation sans rechargement : les transitions de page
// remplacent le corps du document, et tout ecouteur pose sur un element part
// avec lui.
const CHEMIN_PAGE = location.pathname;
function demarrerPage() {
  // Ce script n'appartient qu'a cette page : on ne le rejoue que lorsqu'on y
  // revient. Sans cette garde, il s'executerait sur toutes les autres.
  if (location.pathname !== CHEMIN_PAGE) return;

(function(){
  var zone=document.querySelector('.rdv-zone');
  if(!zone||zone.dataset.pose==='1') return;
  zone.dataset.pose='1';

  var url=zone.dataset.rdvUrl;
  if(!url) return;

  var charge=false;

  // Charge le script de Calendly une seule fois, puis rend le calendrier dans
  // la zone. La promesse se resout meme si le script etait deja la.
  var chargerScript=function(){
    return new Promise(function(resoudre,rejeter){
      if(window.Calendly) return resoudre();
      var s=document.createElement('script');
      s.src='https://assets.calendly.com/assets/external/widget.js';
      s.async=true;
      s.onload=function(){resoudre();};
      s.onerror=function(){rejeter(new Error('script'));};
      document.head.appendChild(s);
      // La feuille de style de Calendly : sans elle le calendrier s'affiche
      // sans mise en forme.
      if(!document.querySelector('link[href*="calendly.com"]')){
        var l=document.createElement('link');
        l.rel='stylesheet';
        l.href='https://assets.calendly.com/assets/external/widget.css';
        document.head.appendChild(l);
      }
    });
  };

  var afficher=function(){
    if(charge) return Promise.resolve();
    charge=true;
    var appel=zone.querySelector('.rdv-appel');
    var boite=document.createElement('div');
    boite.className='rdv-calendrier';
    zone.appendChild(boite);
    if(appel) appel.hidden=true;

    // Calendly pose height="100%" sur son iframe et annonce la hauteur reelle
    // de son contenu par un message. On l'ecoute pour ajuster au pixel : sans
    // cela la hauteur reste celle du CSS, trop haute sur un ecran large et
    // trop courte des que le formulaire de reservation s'allonge.
    if(!window.__safiaRdvEcoute){
      window.__safiaRdvEcoute=true;
      window.addEventListener('message',function(e){
        if(!/calendly\.com$/.test((e.origin||'').replace(/^https?:\/\//,''))) return;
        var d=e.data;
        if(!d||d.event!=='calendly.page_height'||!d.payload) return;
        var h=parseInt(String(d.payload.height),10);
        // Un message a 2 px arrive pendant l'initialisation : l'ignorer evite
        // de replier le calendrier juste apres l'avoir ouvert.
        if(!isNaN(h)&&h>400){
          var z=document.querySelector('.rdv-calendrier');
          if(z) z.style.height=h+'px';
        }
      });
    }

    return chargerScript().then(function(){
      window.Calendly.initInlineWidget({url:url,parentElement:boite});
      // Le focus part sur le calendrier : un visiteur au clavier doit arriver
      // sur ce qu'il vient de demander, pas rester sur un bouton disparu.
      boite.setAttribute('tabindex','-1');
      boite.focus({preventScroll:true});
    }).catch(function(){
      // RIEN NE DOIT RESTER SANS ISSUE. Si le script ne se charge pas, on
      // rend l'appel a l'action, qui porte le lien direct vers Calendly.
      charge=false;
      boite.remove();
      if(appel){
        appel.hidden=false;
        var p=appel.querySelector('.rdv-repli');
        if(p) p.textContent='';
        var alerte=document.createElement('p');
        alerte.className='rdv-repli';
        alerte.innerHTML='Le calendrier n’a pas pu se charger. <a class="lien" href="'+url+'" target="_blank" rel="noopener">Ouvrir le calendrier sur Calendly</a>';
        appel.appendChild(alerte);
      }
    });
  };

  var bouton=zone.querySelector('[data-rdv-charger]');
  if(bouton) bouton.addEventListener('click',afficher);

  // Le bouton du haut de page fait les deux : il amene au calendrier et le
  // deplie, pour eviter un second clic une fois arrive en bas.
  var ancre=document.querySelector('[data-rdv-ancre]');
  if(ancre){
    ancre.addEventListener('click',function(e){
      e.preventDefault();
      afficher();
      var cible=document.getElementById('rendez-vous');
      if(cible) cible.scrollIntoView({behavior:'smooth',block:'start'});
      // L'adresse reste partageable : on inscrit l'ancre sans recharger.
      if(history.replaceState) history.replaceState(null,'','#rendez-vous');
    });
  }

  // Quelqu'un qui arrive directement sur /fondateur/#rendez-vous a deja
  // exprime son intention : on deplie sans lui demander un clic de plus.
  if(location.hash==='#rendez-vous') afficher();
})();
}

demarrerPage();
document.addEventListener('astro:page-load', demarrerPage);
