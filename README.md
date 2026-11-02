## 📸 Aperçu

| Écran principal (Cotes & Matchs) | Panier / Paris sélectionnés |
| :---: | :---: |
| ![Écran principal](https://github.com/user-attachments/assets/62307e7d-5b43-4b74-a0c3-dfee7c5db1a8) | ![Panier](https://github.com/user-attachments/assets/62307e7d-5b43-4b74-a0c3-dfee7c5db1a8) |

## 🚀 Note sur le déploiement & Mode Démo

> **Note technique :** L'application s'appuie en local sur un serveur proxy (dossier `server/`) pour interroger l'API de football en toute sécurité. Sur le déploiement statique Vercel, l'application bascule automatiquement en **mode démonstration** avec des données de test. Pour profiter de l'application connectée en temps réel avec la vraie API, suivez les instructions de la section d'installation locale.

## 🚀 Note sur le déploiement & Mode Démo

> **Note technique :** L'application s'appuie en local sur un serveur proxy (dossier `server/`) pour interroger l'API de football en toute sécurité. Sur le déploiement statique Vercel, l'application bascule automatiquement en **mode démonstration** avec des données de test. Pour profiter de l'application connectée en temps réel avec la vraie API, suivez les instructions de la section d'installation locale.

</div>

---

## 📸 Aperçu

| Écran principal (Cotes & Matchs) | Panier / Paris sélectionnés |
| :---: | :---: |
| <img width="100%" src="https://github.com/user-attachments/assets/62307e7d-5b43-4b74-a0c3-dfee7c5db1a8" alt="Écran principal" /> | <img width="100%" src="https://github.com/user-attachments/assets/..." alt="Panier" /> |

## 🚀 Note sur le déploiement & Mode Démo

> **Note technique :** L'application s'appuie en local sur un serveur proxy (dossier `server/`) pour interroger l'API de football en toute sécurité. Sur le déploiement statique Vercel, l'application bascule automatiquement en **mode démonstration** avec des données de test. Pour profiter de l'application connectée en temps réel avec la vraie API, suivez les instructions de la section d'installation locale.



</div>

</div>

---

Interface portfolio de comparaison de marchés football, construite avec React et Vite. Elle propose un mode démonstration utilisable sans compte fournisseur et une connexion API facultative.

## Fonctions

- 14 compétitions et 168 clubs au catalogue démo, répartis en Europe, Amérique du Nord, Amérique du Sud et Australie.
- Fixtures et marchés simulés localement par défaut.
- Filtre par date, recherche de club, favoris persistants sur cet appareil et repérage des meilleures offres.
- Coupon combiné avec calcul de cote, retour potentiel et gain estimé.
- Mise en page responsive, indicateurs de chargement, actualisation et animations respectant le réglage de réduction des mouvements.
- API Express avec liste des compétitions autorisées, cache de cinq minutes, requêtes simultanées regroupées et repli sur le cache en cas d’indisponibilité.

Le coupon est une simulation locale et ne transmet aucune mise. Les données de démonstration ne sont pas des cotes réelles.

## Démarrer

Prérequis : Node.js 18 ou supérieur.

Terminal 1, depuis le dossier server :

    npm install
    npm start

Terminal 2, depuis le dossier client :

    npm install
    npm run dev

Ouvrez l’adresse locale affichée par Vite. Si le serveur API ou sa clé n’est pas configuré, l’application affiche les rencontres simulées.

## Cotes fournisseur facultatives

Copiez server/.env.example vers server/.env, ajoutez ODDS_API_KEY, puis redémarrez le serveur. La clé reste côté serveur : les appels du navigateur passent par le proxy Vite.

- Santé de l’API : http://127.0.0.1:3001/health
- Cotes : http://127.0.0.1:3001/odds?league=soccer_epl

Les compétitions indisponibles chez le fournisseur restent visibles en mode démo.

## Organisation

- client/src/App.jsx : interface, filtres, favoris et coupon.
- client/src/demo.js : données de démonstration reproductibles.
- client/src/App.css et client/src/extra.css : identité visuelle, responsive et animations.
- server/server.js : API de cotes et cache.

## Écussons des clubs anglais

Les blasons locaux de Premier League sont servis depuis client/public/logos afin qu’ils restent visibles sans accès réseau. Les fichiers sont issus des URL de blason utilisées par football-data.org; les marques appartiennent à leurs clubs respectifs et sont affichées pour identifier les équipes.

Source du format des écussons et identifiants d’équipe : https://docs.football-data.org/general/v4/team.html
## 🚀 Démo en ligne
Vous pouvez tester l'application en direct ici : [https://football-betting-app-three.vercel.app/]

> **Note technique :** L'application s'appuie en local sur un serveur proxy (Dossier `server/`) pour interroger l'API de football en toute sécurité. Sur le déploiement statique Vercel, l'application bascule automatiquement en **mode démonstration** avec des données de test. Pour profiter de l'application connectée en temps réel avec la vraie API, suivez les instructions de la section Installation locale.
