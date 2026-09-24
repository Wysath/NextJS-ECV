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
| `NEXT_PUBLIC_SITE_URL` | en production | URL publique absolue, sans barre oblique finale. Alimente les métadonnées, le sitemap et `robots.txt` |

En production, `NEXT_PUBLIC_SITE_URL` n'est pas facultative au sens strict : sans elle le site retombe sur `http://localhost:3000` et publie cette adresse dans son sitemap et ses balises Open Graph.

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

Les quatre variables ci-dessus doivent être définies dans les réglages du projet, `NEXT_PUBLIC_SITE_URL` et `BETTER_AUTH_URL` portant l'URL de production. Ne propage pas `BETTER_AUTH_URL` aux déploiements de prévisualisation : leur URL diffère à chaque build et l'authentification rejetterait l'origine. Better Auth retombe alors seul sur `VERCEL_URL`.

Le schéma doit exister sur la branche Neon visée avant le premier déploiement (`npm run db:push` en pointant `DATABASE_URL` sur cette branche).

## Retour critique sur Next.js

### Ce qui tient ses promesses

Les Server Components suppriment une couche entière. Les pages de ce projet interrogent Neon directement, sans API REST intermédiaire : pas de route à écrire, pas de types à maintenir en double, pas de sérialisation à déboguer. C'est le gain le plus net du framework, et il est réel.

Le prérendu est presque gratuit. `generateStaticParams` et `export const revalidate = 3600` dans `src/app/tableaux/[slug]/page.tsx` suffisent à générer les fiches d'œuvres en statique et à les régénérer toutes les heures. Deux lignes pour un comportement qui demandait un pipeline entier il y a quelques années.

Le tableau affiché en fin de build annonce, route par route, ce qui est statique, prérendu ou rendu à la demande. Peu de frameworks rendent leur propre comportement aussi lisible.

### Ce que ça coûte

**Le build exécute le code de l'application.** Pour collecter les métadonnées, `next build` évalue les modules de toutes les routes. Conséquence : une variable d'environnement absente ne provoque pas une erreur au premier appel HTTP, elle fait échouer la compilation entière. Ce projet en a fait les frais au déploiement. Une valeur vide dans `NEXT_PUBLIC_SITE_URL` a atteint `new URL("")` dans le layout racine, et le build est mort sur `ERR_INVALID_URL, input: ''`, sans jamais nommer la variable responsable. Next fait de la configuration d'environnement une dépendance critique de sa phase de build, mais ne fournit aucun mécanisme pour la valider.

**La frontière serveur/client repose sur la discipline du développeur.** `"use client"` est une directive textuelle, pas un type. Rien dans le compilateur n'empêche d'importer un module serveur depuis un composant client. La seule protection réelle est `server-only`, un paquet tiers qu'il faut penser à importer manuellement dans chaque module concerné, avec les exceptions à documenter à la main. Un framework qui a fait de cette séparation son argument principal devrait la faire respecter par son système de types, pas par des conventions.

**Le rythme des ruptures est élevé.** Next génère lui-même un fichier `AGENTS.md` dont la première phrase est « This is NOT the Next.js you know ». Quand un framework livre un avertissement expliquant que sa propre documentation en ligne et les réponses trouvées ailleurs sont probablement périmées, le coût de maintenance n'est pas accidentel, il est structurel.

### Bilan

Pour ce projet, un site de musée à contenu majoritairement statique avec une couche d'authentification légère, Next.js est le bon outil : le prérendu sert directement le référencement et les Server Components évitent d'écrire une API. L'arbitrage serait nettement moins favorable pour une application très interactive derrière un login, où l'on paierait la complexité du rendu serveur sans bénéficier du statique.
