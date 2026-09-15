(function(){
  var boutons=document.querySelectorAll('.bascule button');
  var prix=document.getElementById('prix'), periode=document.getElementById('periode'), equiv=document.getElementById('equiv'), conseiller=document.getElementById('conseiller');
  if(!boutons.length||!prix) return;
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
})();
