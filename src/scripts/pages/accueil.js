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
      prix.textContent=annuel?'299 €':'29,99 €';
      periode.textContent=annuel?'par an':'par mois';
      equiv.textContent=annuel?'Soit 24,92 € par mois au lieu de 29,99 €':'Sans conseiller. Passe à l\u2019annuel pour l\u2019ajouter.';
      conseiller.hidden=!annuel;
    });
  });


  // Newsletter (maquette : pas d'envoi réel)
  document.getElementById('nl').addEventListener('submit',function(e){
    e.preventDefault();
    var email=document.getElementById('email'), c=document.getElementById('confirm');
    c.hidden=false;
    if(!email.value || !/^\S+@\S+\.\S+$/.test(email.value)){c.style.color='#FFD1DC';c.textContent='Saisis une adresse email valide, par exemple ton@email.fr.';email.focus();return;}
    c.style.color='';c.textContent='Inscription enregistrée. Premier email bientôt.';email.value='';
  });
})();
