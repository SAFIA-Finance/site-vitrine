
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
  var D={
    livret:{
      q:"Mon livret A est plein, je fais quoi ?",
      r:["Bonne base : ton épargne de précaution couvre environ 9 mois de dépenses, au-delà des 3 à 6 mois généralement recommandés.","Tu peux donc regarder des placements de plus long terme."],
      v:[["Horizon","Un placement en private equity se pense sur 5 ans ou plus."],["Risque","Contrairement au Livret A (hors inflation), il peut perdre de la valeur et peut présenter des risques de liquidité."]],
      d:[["Pourquoi cette réponse",["Dépenses moyennes : 2 380 € par mois (3 derniers mois)","Épargne disponible : 22 950 € sur ton Livret A","Ton profil : niveau 3 sur 5, horizon 8 ans"]],
         ["Deux pistes à comparer",["A. Garder de la marge avec un LDDS, disponible à tout moment","B. Ouvrir un PEA pour un horizon long"]]],
      s:"Sources : service-public.fr, fiche Livret A, consultée le 13/09/2026 · Méthodologie SAFIA, épargne de précaution"
    },
    per:{
      q:"Comment fonctionne la déduction du PER ?",
      r:["Les versements sur un PER individuel peuvent être déduits de ton revenu imposable, dans la limite d'un plafond annuel propre à ta situation.","L'économie d'impôt dépend donc de ta tranche marginale : plus elle est élevée, plus la déduction pèse."],
      v:[["Contrepartie","L'épargne est bloquée jusqu'à la retraite, sauf cas de déblocage prévus par la loi."],["À la sortie","Ce qui a été déduit à l'entrée est imposé à la sortie."]],
      d:[["Ce que j'ai utilisé",["Ta tranche marginale déclarée : 30 %","Plafond disponible que tu as saisi : 4 200 €","Je n'ai pas ton avis d'imposition : le plafond réel peut différer"]],
         ["Ce que ça donnerait",["Un versement de 4 000 € réduirait ton impôt d'environ 1 200 €","Cette somme reste bloquée jusqu'à la retraite"]]],
      s:"Sources : BOFiP, régime du plan d'épargne retraite, consulté le 13/09/2026 · Ton profil SAFIA"
    },
    secteur:{
      q:"Est-ce que je suis trop exposé à un seul secteur ?",
      r:["Oui, sur un point : 41 % de ton portefeuille actions est investi sur la technologie américaine.","Si ce secteur baisse, une grande partie de ton épargne baisse en même temps."],
      v:[["Concentration","Une seule zone et un seul secteur portent la moitié de ton risque."],["Devise","Cette part est en dollars : son rendement dépend aussi du taux de change."]],
      d:[["D'où vient ce chiffre",["3 lignes analysées sur tes comptes connectés","Composition sectorielle des fonds au 31/08/2026","Ta poche obligataire et tes livrets sont exclus du calcul"]],
         ["Ce que ça ne dit pas",["Une concentration n'est pas une erreur : elle peut être un choix assumé","Je ne connais pas les placements que tu détiens hors SAFIA"]]],
      s:"Sources : documents d'information clé des fonds détenus, au 31/08/2026 · Méthodologie SAFIA, diversification"
    },
    holding:{
      q:"Je vends ma société, faut-il passer par une holding ?",
      r:["Une holding est une société qui détient les titres d'autres sociétés. Dans une cession, le montage classique s'appelle l'apport-cession : tu apportes les titres de ta société à une holding que tu contrôles, <strong>avant</strong> la vente. La plus-value d'apport n'est alors pas imposée immédiatement, elle est placée en report.",
         "Concrètement, c'est la holding qui vend, et c'est elle qui encaisse le prix. Tu réinvestis donc avec la totalité du produit de cession, sans que l'impôt ait été prélevé au passage."],
      b:[["Ce que ça peut t'apporter",
          ["Un report de l'imposition de la plus-value, donc un capital à réinvestir plus important",
           "Un effet de levier réel : quelques dizaines de milliers d'euros d'impôt différés produisent des intérêts pendant des années",
           "Une fiscalité allégée sur les dividendes remontés des filiales, via le régime mère-fille",
           "Un cadre qui facilite la transmission : en cas de donation des titres de la holding, le report est purgé si le bénéficiaire les conserve au moins six ans"]],
         ["Ce que ça t'impose",
          ["Un report n'est pas une exonération : l'impôt reste dû, c'est une dette latente inscrite à ton nom",
           "Si la holding revend les titres moins de trois ans après l'apport, elle doit réinvestir au moins 70 % du prix dans une activité économique éligible, dans les trois ans, sinon le report tombe",
           "L'argent est dans la holding, pas sur ton compte : le sortir pour un usage personnel se fait en dividende ou en rémunération, et c'est imposé",
           "Une société de plus à créer, à faire vivre et à faire certifier : coûts, comptabilité, assemblées"]]],
      v:[["Le calendrier","L'apport doit précéder la cession, et le projet de vente ne doit pas être déjà ficelé. Un apport réalisé trop tard peut être requalifié par l'administration."]],
      cta:"Allons plus loin ensemble, ou contacte dès maintenant un conseiller SAFIA pour mettre en place ta holding.",
      s:"Sources : article 150-0 B ter du code général des impôts, rédaction issue de la loi de finances pour 2026, et BOI-RPPM-PVBMI-30-10-60-20, consultés le 16/09/2026 · Méthodologie SAFIA, opérations de cession"
    }
  };

  var fil=document.getElementById('fil'), qtxt=document.getElementById('q-txt'), rtxt=document.getElementById('r-txt');
  var reduit=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timer=null;

  function html(d){
    var s='<svg class="etincelle" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9L12 2.5z" fill="#fff"/></svg>';
    s+='<div class="b-ia">';
    d.r.forEach(function(p){s+='<p>'+p+'</p>';});
    if(d.b){
      d.b.forEach(function(bloc){
        s+='<p class="ss-titre">'+bloc[0]+'</p><ul>';
        bloc[1].forEach(function(li){s+='<li>'+li+'</li>';});
        s+='</ul>';
      });
    }
    if(d.v && d.v.length){
      s+='<p class="ss-titre">À garder en tête</p><ul>';
      d.v.forEach(function(v){s+='<li><b>'+v[0]+'</b> — '+v[1]+'</li>';});
      s+='</ul>';
    }
    if(d.cta){ s+='<p class="cta-bulle">'+d.cta+'</p>'; }
    s+='<p class="src-bulle">'+d.s+'</p>';
    s+='</div>';
    return s;
  }

  function montrer(cle){
    var d=D[cle];
    clearTimeout(timer);
    qtxt.textContent=d.q;
    if(reduit){ rtxt.innerHTML=html(d); brancher(); return; }
    rtxt.innerHTML='<div class="b-ia frappe"><i></i><i></i><i></i></div>';
    timer=setTimeout(function(){
      rtxt.innerHTML=html(d);
      brancher();
    },900);
  }

  function brancher(){}

  document.querySelector('.questions').addEventListener('click',function(e){
    var b=e.target.closest('.q-btn'); if(!b) return;
    document.querySelectorAll('.q-btn').forEach(function(x){x.classList.toggle('actif',x===b);});
    montrer(b.dataset.q);
  });

  montrer('livret');
})();
}

demarrerPage();
document.addEventListener('astro:page-load', demarrerPage);
