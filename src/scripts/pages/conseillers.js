(function(){
  var f=document.getElementById('fdemo'), r=document.getElementById('fretour');
  if(!f) return;
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var obligatoires=['nom','cabinet','mail'].filter(function(id){var el=document.getElementById(id);return el && !el.value.trim();});
    var mail=document.getElementById('mail').value;
    r.hidden=false;
    if(obligatoires.length){ r.style.color='#FFD1DC'; r.textContent='Complétez les champs obligatoires.'; document.getElementById(obligatoires[0]).focus(); return; }
    if(!/^\S+@\S+\.\S+$/.test(mail)){ r.style.color='#FFD1DC'; r.textContent='Saisissez une adresse email valide.'; document.getElementById('mail').focus(); return; }
    r.style.color=''; r.textContent='Demande enregistrée. Nous revenons vers vous sous 48 heures ouvrées.';
    f.reset();
  });
})();
