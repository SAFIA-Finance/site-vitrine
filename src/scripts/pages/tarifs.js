(function(){
  var boutons=document.querySelectorAll('.bascule button');
  var prix=document.getElementById('prix'), periode=document.getElementById('periode'), equiv=document.getElementById('equiv'), conseiller=document.getElementById('conseiller');
  if(!boutons.length||!prix) return;
  boutons.forEach(function(b){
    b.addEventListener('click',function(){
      boutons.forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});
      var annuel=b.dataset.periode==='annuel';
      // Le chiffre mis en avant est toujours mensuel : c'est celui auquel un
      // visiteur compare son budget. Le total annuel reste affiché dessous.
      prix.textContent=annuel?'24,92 €':'29,99 €';
      periode.textContent='par mois';
      equiv.textContent=annuel?'Facturé 299 € par an, soit 2 mois offerts':'Sans conseiller. Passe à l\u2019annuel pour l\u2019ajouter.';
      conseiller.hidden=!annuel;
    });
  });
})();
