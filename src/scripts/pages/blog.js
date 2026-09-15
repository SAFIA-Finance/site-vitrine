import { envoyer, emailValide } from '../formulaires.js';

(function(){
  var boutons=document.querySelectorAll('.f-btn');
  boutons.forEach(function(b){
    b.addEventListener('click',function(){
      boutons.forEach(function(x){x.classList.toggle('actif',x===b);});
    });
  });

  // Newsletter : inscription dans Brevo, via le relais
  var f=document.getElementById('nl-blog'), c=document.getElementById('confirm-blog');
  if(f){
    f.addEventListener('submit',async function(e){
      e.preventDefault();
      var email=document.getElementById('email-blog'), bouton=f.querySelector('button[type="submit"]');
      c.hidden=false;
      if(!emailValide(email.value)){c.style.color='#FFD1DC';c.textContent='Saisis une adresse email valide.';email.focus();return;}
      bouton.disabled=true; c.style.color=''; c.textContent='Inscription en cours…';
      try{
        await envoyer('newsletter',{email:email.value, site:f.elements.site.value});
        c.textContent='Inscription enregistrée.'; email.value='';
      }catch(err){
        c.style.color='#FFD1DC'; c.textContent=err.message;
      }finally{
        bouton.disabled=false;
      }
    });
  }
})();
