# Pages légales

Cinq pages du site sont **générées** à partir des documents Word de SAFIA :

| Page | Document source |
|---|---|
| `/mentions-legales/` | `Mentions légales SAFIA 12 août 2026.docx` |
| `/politique-de-confidentialite/` | `Politique de confidentialité SAFIA  12 août 2026.docx` |
| `/cgu/` | `CGU SAFIA  12 août 2026.docx` |
| `/disclaimer/` | `Disclaimer SAFIA 12 août 2026.docx` |
| `/politique-cookies/` | `Politique de cookies SAFIA.docx` |

Les documents vivent dans `reference/pages-legales/`. **Ils font foi** : les
fichiers `src/pages/*.astro` correspondants sont écrasés à chaque conversion et
ne doivent jamais être modifiés à la main.

## Mettre à jour un texte légal

1. Corriger le document Word et le redéposer dans `reference/pages-legales/`,
   sous le même nom. Un nom différent demande de corriger la liste `PAGES` dans
   `outils/docx-en-pages.mjs`.
2. Extraire le XML des documents (un `.docx` est une archive zip) :

```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem
$src = "reference\pages-legales"
$dst = "$env:TEMP\safia-docx"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Get-ChildItem $src -Filter *.docx | ForEach-Object {
  $nom = [IO.Path]::GetFileNameWithoutExtension($_.Name)
  $zip = [IO.Compression.ZipFile]::OpenRead($_.FullName)
  foreach($e in $zip.Entries | Where-Object { $_.FullName -in 'word/document.xml','word/_rels/document.xml.rels' }){
    [IO.Compression.ZipFileExtensions]::ExtractToFile($e, (Join-Path $dst ($nom + '__' + ($e.FullName -replace '/','_'))), $true)
  }
  $zip.Dispose()
}
```

3. Convertir, construire, vérifier, publier :

```powershell
node outils\docx-en-pages.mjs "$env:TEMP\safia-docx"
npm run build
npm run verifier
git add -A ; git commit -m "Pages légales : mise à jour" ; git push
```

## Corriger un document sans ouvrir Word

L'extraction ci-dessus ne fait que lire. Pour **réécrire** un `.docx`, le mode
`Update` de `ZipFile` remplace une entrée en place, sans reconstruire l'archive
ni toucher aux styles, à la numérotation, aux polices ni aux relations :

```powershell
$zip = [IO.Compression.ZipFile]::Open($chemin, 'Update')
$e = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$flux = $e.Open()
$flux.SetLength(0)
$ecrivain = New-Object IO.StreamWriter($flux, (New-Object Text.UTF8Encoding($false)))
$ecrivain.Write($xml)
$ecrivain.Flush() ; $ecrivain.Dispose() ; $flux.Dispose() ; $zip.Dispose()
```

`SetLength(0)` est obligatoire : sans lui, un texte plus court laisse la queue
de l'ancien contenu derrière lui. L'encodage doit être **UTF-8 sans BOM**, que
Word exige pour `word/document.xml`.

Trois précautions, toutes payées sur le terrain :

- **Copier les `.docx` avant d'y toucher.** Le dossier `originaux-2026-09-16/`
  garde l'état d'avant les premiers patches, pas l'état courant : une
  restauration depuis ce dossier ferait perdre les corrections ultérieures.
- **Contrôler l'archive après écriture**, en comparant la liste de ses entrées
  à celle de la sauvegarde et en vérifiant que le XML commence par `<?xml` et
  finit par `</w:document>`. Une archive corrompue ne s'ouvre plus dans Word.
- **Comparer les pages reconverties aux précédentes.** La conversion régénère
  les cinq pages : le diff doit ne montrer que ce qu'on a voulu changer.

## Une seule source de vérité

Tout le texte publié vient des documents Word. Aucun complément n'est ajouté du
côté du site : quand un point technique change (mesure d'audience, prestataire,
hébergeur), c'est le document Word qui doit être corrigé, puis reconverti.
`outils/maj-word.mjs` montre comment modifier le texte d'un .docx sans toucher à
sa mise en forme, et refuse d'écrire si un passage visé n'est pas retrouvé.

**Attention à sa portée** : il travaille au niveau du **paragraphe**, qu'il
remplace par un paragraphe reconstruit en **un seul run**. C'est sans risque
pour un paragraphe uniforme, mais cela **aplatit la mise en forme** d'un
paragraphe qui mélange plusieurs runs. Le paragraphe du Médiateur de l'AMF, dans
les mentions légales, est de ceux-là : le nom de l'organisme y est en gras et
l'adresse ne l'est pas. Pour une retouche qui ne concerne que quelques
caractères, remplacer le texte à l'intérieur du `<w:t>` visé est plus sûr, et ne
touche à aucune balise. Ses patches sont par ailleurs **codés en dur pour les
corrections du 16 septembre 2026** : le relancer tel quel échouerait désormais,
ces passages n'existant plus dans leur forme d'origine.

## Cohérence à tenir

Ces textes engagent SAFIA. Trois points demandent une vérification à chaque
évolution technique du site :

- **Un nouvel outil de mesure d'audience ou de suivi** doit figurer dans la
  politique de cookies, et n'être chargé qu'après consentement.
- **Un nouveau prestataire** recevant des données (formulaires, emailing,
  hébergement) doit être ajouté à la liste des sous-traitants.
- **Les durées de conservation annoncées** doivent correspondre à la réalité :
  treize mois pour les cookies de mesure d'audience, trois ans après le dernier
  contact pour les demandes de démonstration, jusqu'à désinscription pour la
  newsletter.

Le dernier point vaut aussi pour le code : la durée de treize mois est fixée par
`cookie_expires` dans `src/scripts/site.js`, sans quoi Google appliquerait deux
ans.
