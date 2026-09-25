# The Met

Site vitrine du Metropolitan Museum of Art : catalogue de peintures, fiches d'œuvres, billetterie et espace personnel avec favoris.

Projet Next.js 16 (App Router, React Server Components, Turbopack, React Compiler) adossé à une base Postgres Neon.

## Fonctionnalités

- Catalogue filtrable par thème, mouvement et époque, triable, avec recherche à partir de trois caractères
- Fiches d'œuvres prérendues et régénérées toutes les heures, images haute définition servies depuis Wikimedia Commons
- Authentification par e-mail et mot de passe, gestion du profil et suppression de compte
- Favoris persistés en base, réservés aux comptes connectés
- Billetterie avec choix de date, calcul du total et page de confirmation
- Référencement : métadonnées par page, URLs canoniques, `sitemap.xml`, `robots.txt`, données structurées JSON-LD et image Open Graph générée
- Animations GSAP, défilement adouci Lenis, curseur personnalisé, transitions de page

## Prérequis

- Node.js 20.9 ou supérieur (Next 16 l'exige ; la production tourne en Node 24)
- Un projet [Neon](https://neon.com) pour la base Postgres

## Installation

```bash
git clone https://github.com/Wysath/NextJS-ECV.git
cd NextJS-ECV
npm install
cp .env.example .env.local
```

Renseigne ensuite `.env.local` (voir ci-dessous), puis crée les tables :

```bash
npm run db:push
npm run dev
```

Le site est servi sur [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

| Variable | Requise | Rôle |
| --- | --- | --- |
| `DATABASE_URL` | oui | Chaîne de connexion Neon **poolée** (l'hôte contient `-pooler`) |
| `BETTER_AUTH_SECRET` | oui | Clé de signature des sessions, générée par `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | oui | URL de base du site, `http://localhost:3000` en local |
| `NEXT_PUBLIC_SITE_URL` | non sur Vercel | URL publique absolue, sans barre oblique finale. Alimente les métadonnées, le sitemap et `robots.txt` |

Sur Vercel, `NEXT_PUBLIC_SITE_URL` peut rester vide : le site lit alors `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`, que la plateforme renseigne sur chaque déploiement, prévisualisations comprises. Cela suppose que l'option « Enable access to System Environment Variables » soit active dans les réglages du projet. Renseigne `NEXT_PUBLIC_SITE_URL` pour un domaine personnalisé ou un autre hébergeur : elle a la priorité. Sans aucune des deux, le site retombe sur `http://localhost:3000` et publierait cette adresse dans son sitemap et ses balises Open Graph.

Attention si tu copies ces valeurs dans un tableau de bord d'hébergeur : les guillemets présents dans `.env.local` ne doivent pas être repris. Un fichier `.env` les retire au chargement, une interface web les conserve tels quels.

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Sert le build de production |
| `npm run lint` | ESLint |
| `npm run db:push` | Applique le schéma Drizzle à la base |
| `npm run db:studio` | Ouvre Drizzle Studio |
| `npm run auth:generate` | Régénère `src/db/auth-schema.ts` depuis la configuration Better Auth |

## Architecture

```
src/
  app/          Routes App Router, Server Actions et routes d'API
  components/   Composants d'interface, regroupés par domaine
  config/       Configuration du site (nom, URL, navigation, horaires)
  data/         Contenu éditorial et traductions des notices
  db/           Schéma Drizzle et connexion Neon
  lib/          Logique métier, accès aux données, utilitaires
  stores/       État client global (Zustand)
```

L'alias `@/` pointe vers `src/`.

Les modules de `src/lib/` qui touchent à la base ou aux secrets importent `server-only` : toute tentative de les charger depuis un composant client échoue à la compilation. Seul `src/lib/auth.ts` s'en abstient, car le CLI Better Auth doit pouvoir le charger en dehors de Next pour régénérer le schéma.

## Données

Les œuvres proviennent de l'API publique `https://api-museum.vercel.app`, mise en cache une heure. Les images sont résolues sur Wikimedia Commons et leurs métadonnées mises en cache vingt-quatre heures.

La base Neon ne stocke que ce qui appartient aux utilisateurs : les tables Better Auth (`user`, `session`, `account`, `verification`) et la table `favorite`, qui associe un compte à un slug d'œuvre.

## Déploiement

Hébergé sur Vercel, déclenché par chaque push sur `main`.

`DATABASE_URL` et `BETTER_AUTH_SECRET` doivent être définies dans les réglages du projet. `BETTER_AUTH_URL` porte l'URL de production, et `NEXT_PUBLIC_SITE_URL` reste facultative puisque Vercel fournit déjà le domaine. Ne propage pas `BETTER_AUTH_URL` aux déploiements de prévisualisation : leur URL diffère à chaque build et l'authentification rejetterait l'origine. Better Auth retombe alors seul sur `VERCEL_URL`.

Le schéma doit exister sur la branche Neon visée avant le premier déploiement (`npm run db:push` en pointant `DATABASE_URL` sur cette branche).

## Retour critique sur Next.js

Ce qui m'a le plus servi, c'est de pouvoir interroger la base directement depuis une page, sans écrire d'API entre les deux. Et le prérendu : deux lignes, `generateStaticParams` et `revalidate`, et les fiches d'œuvres sont générées à l'avance puis rafraîchies toutes les heures. Sur un site de musée, c'est exactement ce qu'il faut.

Le problème, c'est que ce prérendu est fragile dès qu'un utilisateur se connecte. Le header affiche un lien « Mon compte » qui dépend de la session. Si je lis cette session côté serveur, Next considère que la page dépend de la requête, et tout le site bascule en rendu dynamique. J'ai donc dû faire l'inverse de ce que le framework recommande : passer `AccountLink` en composant client et lire la session dans le navigateur. Même chose pour les favoris, où j'ai créé une route d'API (`/api/favorites/[slug]`) uniquement pour que les pages d'œuvres restent statiques. Next pousse à tout faire côté serveur, puis rend cette approche coûteuse dès qu'une donnée dépend de l'utilisateur. Les contournements fonctionnent, mais ce sont des contournements.

La deuxième surprise est venue du déploiement. En local tout fonctionnait, sur Vercel le build échouait. Parce que `next build` exécute réellement le code des pages pour en extraire les métadonnées, une variable d'environnement mal renseignée ne provoque pas une erreur au premier chargement du site : elle empêche la compilation. Et le message ne mentionnait même pas la variable en cause, juste `ERR_INVALID_URL, input: ''`. Il m'a fallu remonter jusqu'au layout racine pour comprendre. Next rend la configuration indispensable au build sans fournir le moindre moyen de la vérifier.

Dernier point, plus mineur : l'optimisation d'images, souvent présentée comme un argument majeur du framework, ne me sert pas ici. Les tableaux viennent de Wikimedia Commons, qui utilise son propre système de redimensionnement, donc `next.config.ts` les laisse volontairement hors de l'optimiseur. La fonctionnalité existe, mais pas pour la source d'images principale du projet.

Au final, je referais le même choix pour ce type de site, majoritairement statique et où le référencement compte. Pour une application derrière un écran de connexion, où presque chaque page dépend de l'utilisateur, je crois que je paierais la complexité du rendu serveur sans en retirer grand-chose.
