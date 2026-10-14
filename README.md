# Oscar — prototype de la page d’inscription

Ce dépôt contient un prototype React + Vite. Il n’est pas déployé et ne modifie pas la base Supabase.

## Pré-requis
- Node.js 20.19+ ou 22.12+
- npm

## Lancer localement
1. Décompresser l’archive.
2. Dans ce dossier, exécuter `npm install`.
3. Copier `.env.example` vers `.env.local`.
4. Renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Exécuter `npm run dev` et ouvrir l’adresse locale affichée.

## Sécurité
- N’utiliser qu’une clé publishable (ou l’ancienne clé `anon`) dans le navigateur.
- Ne jamais ajouter `service_role`, une clé secrète, un mot de passe de base de données ou une clé JWT de signature dans le frontend.
- Le formulaire appelle `public.register_user` avec `p_country_code: "BF"`.
- Après inscription, le prototype n’ouvre pas automatiquement une session : `register_user` ne renvoie pas de jeton. Le parcours de connexion personnalisé doit être examiné et testé séparément avant intégration.
- La confirmation du mot de passe sert à la validation et est envoyée à la fonction RPC existante ; aucun mot de passe n’est stocké dans le navigateur par le prototype.
- Une clé publique n’est pas une protection d’accès : les permissions SQL, les fonctions `SECURITY DEFINER`, les contrôles de session et la limitation de débit doivent être audités avant le déploiement.
- Ne pas utiliser de données réelles ni lancer des inscriptions de test dans le projet de production.
- Les messages d’erreur du backend sont affichés avec une longueur limitée. Avant un lancement public, remplacer les erreurs détaillées par des messages génériques lorsque nécessaire.

## Vérifications avant publication
- Faire l’audit des 41 fonctions `SECURITY DEFINER` signalées par Supabase et confirmer l’autorisation interne de chaque fonction.
- Vérifier la protection anti-abus / limitation de débit de l’inscription et de la connexion.
- Tester sur une branche ou un projet Supabase de développement.
- Ajouter le parcours de connexion, déconnexion et gestion d’expiration de session, puis réaliser des tests d’accès.
- Repasser les Security Advisors avant toute décision de déploiement.
