(function(){
  var cartes=[].slice.call(document.querySelectorAll('.adn-pile .adn-carte'));
  var choix=document.getElementById('choix'), jauge=document.getElementById('jauge');
  var resultat=document.getElementById('resultat'), liste=document.getElementById('res-liste');
  var pile=document.getElementById('pile'), rejouer=document.getElementById('rejouer');
  var barre=document.getElementById('barre'), pourcent=document.getElementById('pourcent'), niveau=document.getElementById('niveau');
  var i=0, reponses=[];
  var NIVEAUX=['Émergent','Émergent','En construction','En construction','Fiable'];

  function etat(){
    cartes.forEach(function(c,n){
      c.className='adn-carte';
      if(n<i) c.classList.add('cachee');
      else if(n===i+1) c.classList.add('dessous');
      else if(n===i+2) c.classList.add('loin');
      else if(n>i+2) c.classList.add('cachee');
    });
    var pct=Math.round(i/cartes.length*100);
    barre.style.width=Math.max(4,pct)+'%';
    pourcent.textContent=(i===0?1:pct)+' %';
    niveau.textContent='Niveau de confiance : '+NIVEAUX[i];
  }
  function terminer(){
    liste.innerHTML='';
    reponses.filter(function(r){return r.avis!=='passe';}).forEach(function(r){
      var li=document.createElement('li');
      li.className=r.avis;
      li.innerHTML='<b></b><span>'+r.theme+'</span><em>'+(r.avis==='oui'?'compte pour toi':'à éviter')+'</em>';
      liste.appendChild(li);
    });
    pile.hidden=true; choix.hidden=true; jauge.hidden=true; resultat.hidden=false;
  }
  choix.addEventListener('click',function(e){
    var b=e.target.closest('button[data-avis]'); if(!b) return;
    var avis=b.dataset.avis, c=cartes[i];
    reponses.push({theme:c.dataset.theme,avis:avis});
    c.classList.add(avis==='oui'?'part-oui':'part-non');
    i++;
    if(i>=cartes.length){ setTimeout(terminer,330); return; }
    setTimeout(etat,120);
  });
  rejouer.addEventListener('click',function(){
    i=0; reponses=[]; pile.hidden=false; choix.hidden=false; jauge.hidden=false; resultat.hidden=true; etat();
  });
  etat();
})();
