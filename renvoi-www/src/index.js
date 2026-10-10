// Renvoie « www.safia.finance » vers « safia.finance », en redirection
// permanente et en conservant le chemin : www.safia.finance/tarifs/ arrive sur
// safia.finance/tarifs/.
//
// GitHub Pages le faisait tout seul. Chez Cloudflare, le site est un dossier de
// fichiers sans code, qui ne peut pas distinguer deux noms de domaine : ce
// renvoi vit donc à part, sur le seul nom « www ».
export default {
  fetch(requete) {
    const adresse = new URL(requete.url);
    adresse.protocol = 'https:';
    adresse.hostname = 'safia.finance';
    adresse.port = '';
    return Response.redirect(adresse.toString(), 301);
  },
};
