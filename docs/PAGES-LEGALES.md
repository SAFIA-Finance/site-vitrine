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
node outils\docx-en-pages.mjs "$env:TEMP\safia-docx" --complements
npm run build
npm run verifier
git add -A ; git commit -m "Pages légales : mise à jour" ; git push
```

L'option `--complements` est importante : sans elle, les compléments propres au
site ne sont pas repris et disparaissent des pages publiées.

## Compléments propres au site

Les documents Word décrivent **l'application**. Le site, lui, utilise des
services que ces documents ne mentionnent pas. Ces ajouts vivent séparément,
dans `reference/pages-legales/complements/` :

| Fichier | Ce qu'il ajoute |
|---|---|
| `mentions-legales.md` | GitHub comme hébergeur du site, Scaleway restant celui de l'application |
| `politique-de-confidentialite.md` | Newsletter et demandes de démonstration, sous-traitants Brevo, Cloudflare, GitHub et Google |
| `politique-cookies.md` | Google Analytics, consentement préalable, cookies de treize mois, modification du choix |

Ils sont écrits en Markdown simple : `##` et `###` pour les titres, `- ` pour
les listes, `**gras**` et `[lien](https://…)`. Ils apparaissent en fin de page,
après une séparation et la mention « Complément propre au site safia.finance ».

Une reconversion depuis Word ne les efface pas.

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
