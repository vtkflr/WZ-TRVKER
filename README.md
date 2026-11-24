# WZ-TRVKER

Application web complète de suivi Warzone (**Dashboard**, **Amis**, **Méta Armes**, **Défis Hebdo**, **Récompenses / Cadres XP** et **Camouflages**) prête pour **GitHub Pages** et **Supabase**.

## Fichiers du dépôt
- `index.html` : application principale complète (PWA + Tailwind + Supabase + onglet Camos connecté au cloud et textures PNG intégrées).
- `camos.json` & `mw4_warzone_camos-v4_2.json` : catalogue complet des camouflages (37 armes + 8 camouflages Warzone Maîtrise & Secrets).
- `assets/camos/...` : les 15 textures PNG de camouflages déjà générées et prêtes à l'emploi.
- `generateur_png.html` : générateur autonome pour régénérer ou personnaliser les 15 textures `.png`.
- `manifest.json` & `sw.js` : configuration PWA et cache hors-ligne.
- `meta.json` : configurations d'armes méta Saison 1.
- `defis.json` : défis hebdomadaires et saisonniers.
- `rewards-system.js` : système de rangs, titres et cadres d'avatar XP.
- `supabase/schema.sql` : schéma SQL complet (profils, code ami, matchs, amis et progression des camos `user_camo_progress`).
- `.github/workflows/deploy-pages.yml`, `.nojekyll`, `.gitignore` : déploiement automatique sur GitHub Pages.

## Déploiement GitHub Pages
1. Extrayez tout le contenu de cette archive à la racine de votre dépôt GitHub (`main`), y compris le dossier `assets/` et les dossiers cachés (`.github/`, `.nojekyll`, `.gitignore`).
2. Activez **GitHub Pages** dans **Settings > Pages** (source **GitHub Actions** ou branche `main` / `/ (root)`).
3. Exécutez `supabase/schema.sql` dans l'éditeur SQL de votre projet Supabase pour activer la synchronisation cloud des matchs, des amis et des camouflages.
