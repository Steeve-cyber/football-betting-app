
## 📸 Aperçu

| Écran principal (Cotes & Matchs) | Panier / Paris sélectionnés |
| :---: | :---: |
| ![Écran principal](https://github.com/user-attachments/assets/62307e7d-5b43-4b74-a0c3-dfee7c5db1a8) | <img width="683" height="539" alt="Panier" src="https://github.com/user-attachments/assets/fef87c45-d673-40ef-9009-3bffb2d3882f" /> |

## 🚀 Note sur le déploiement & Mode Démo

> **Note technique :** L'application s'appuie en local sur un serveur proxy (dossier `server/`) pour interroger l'API de football en toute sécurité. Sur le déploiement statique Vercel, l'application bascule automatiquement en **mode démonstration** avec des données de test. Pour profiter de l'application connectée en temps réel avec la vraie API, suivez les instructions de la section d'installation locale.

</div>

</div>

---

Interface portfolio de comparaison de marchés football, construite avec React et Vite. Elle propose un mode démonstration utilisable sans compte fournisseur et une connexion API facultative.

## Fonctions

- 14 compétitions, 168 entrées d’équipes et 156 clubs distincts au catalogue démo, répartis en Europe, Amérique du Nord, Amérique du Sud et Australie.
- Fixtures et marchés simulés localement par défaut.
- Filtre par date, recherche de club, favoris persistants sur cet appareil et repérage des meilleures offres.
- Coupon combiné avec calcul de cote, retour potentiel et gain estimé.
- Mise en page responsive, indicateurs de chargement, actualisation et animations respectant le réglage de réduction des mouvements.
- API Express avec liste des compétitions autorisées, cache de cinq minutes, requêtes simultanées regroupées et repli sur le cache en cas d’indisponibilité.

Le coupon est une simulation locale et ne transmet aucune mise. Les données de démonstration ne sont pas des cotes réelles.

## Démarrer

## 📋 Prérequis

Assure-toi d'avoir installé les éléments suivants sur ta machine :
* **Node.js** : `>= 20.x` (Recommandé : version LTS 20 ou supérieure)
* **npm** : `>= 9.x`

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

## Écussons des clubs

Les blasons des 156 clubs distincts du catalogue démo sont enregistrés dans client/public/logos et servis localement, sans dépendance à un chargement externe à l’affichage. La correspondance des noms gère les accents et les variantes courantes entre compétitions.

Les fichiers viennent des ressources d’équipes de football-data.org pour la Premier League, des images d’équipes publiées par ESPN pour les clubs actuels et du dépôt football-badges pour certains clubs historiques. Le logo Western United provient de la page officielle du club. Les marques et écussons appartiennent à leurs détenteurs respectifs et sont utilisés pour identifier les équipes.

Sources : [football-data.org](https://docs.football-data.org/general/v4/team.html), [ESPN Soccer](https://site.api.espn.com/apis/site/v2/sports/soccer/), [football-badges](https://github.com/leoratzlaff/football-badges), [Western United](https://wufc.com.au/news/western-united-fc-unveil-new-logo/).
