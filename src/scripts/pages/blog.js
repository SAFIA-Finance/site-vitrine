(function(){
  var boutons=document.querySelectorAll('.f-btn');
  boutons.forEach(function(b){
    b.addEventListener('click',function(){
      boutons.forEach(function(x){x.classList.toggle('actif',x===b);});
    });
  });
  var f=document.getElementById('nl-blog'), c=document.getElementById('confirm-blog');
  if(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var email=document.getElementById('email-blog');
      c.hidden=false;
      if(!email.value || !/^\S+@\S+\.\S+$/.test(email.value)){c.style.color='#FFD1DC';c.textContent='Saisis une adresse email valide.';email.focus();return;}
      c.style.color='';c.textContent='Inscription enregistrée.';email.value='';
    });
  }
})();
