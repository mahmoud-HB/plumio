# Générateur d’histoires personnalisées pour enfants (MVP)

Un site web simple qui génère une histoire en PDF personnalisée pour un enfant à partir de:
- son nom
- d’un thème choisi
- et d’une photo uploadée

Stack:
- Frontend: Vue 3 + Vite
- Backend: Node.js (Express)
- API IA: OpenAI (GPT pour le texte, gpt-image-1 pour les images)
- PDF: pdf-lib

## Fonctionnement (MVP)
- Page d’accueil:
  - Formulaire (Nom de l’enfant, Thème, Upload d’une photo)
  - Bouton: “Créer mon histoire”
- Backend:
  - Reçoit les infos
  - Génère des pages de texte (enfants) avec GPT
  - Génère des images illustrées (une par page) avec gpt-image-1
  - Assemble le PDF:
    - Page de couverture: Titre + photo de l’enfant
    - Pages suivantes: Texte + illustration
  - Renvoie le PDF au frontend
- Page de résultat:
  - Message “Ton histoire est prête ✨”
  - Bouton “Télécharger le PDF”

## Par défaut (économie coût/latence)
- PAGE_COUNT=6
- IMAGE_SIZE=256x256
- Modèles: gpt-4o-mini (texte), gpt-image-1 (images)
- Ces valeurs sont configurables dans `server/.env`

## Prérequis
- Node.js 18+
- Clé OpenAI (variable OPENAI_API_KEY)

## Docker (local)

```
cp server/.env.example server/.env   # puis renseigner OPENAI_API_KEY (optionnel)
docker compose up -d --build         # front http://localhost:5173, API http://localhost:3000
```

`docker-compose.override.yml` (chargé automatiquement) désactive la vérification TLS dans le conteneur pour les réseaux qui interceptent HTTPS : à supprimer sur un réseau de confiance.

## Déploiement Vercel

Le front (`client`) est servi en statique et l'API Express (`server`) tourne en fonction serverless via `api/index.js`. Sans `OPENAI_API_KEY` dans les variables d'environnement Vercel, l'application utilise le générateur local de secours. Limite Vercel : corps de requête 4,5 Mo (taille de la photo).

## Démarrage (local)

1) Backend
```
cd server
cp .env.example .env
# Ouvrez .env et renseignez OPENAI_API_KEY
npm install
npm start
```
Le serveur écoute par défaut sur http://localhost:3000

2) Frontend
```
cd client
npm install
npm run dev
```
Le frontend écoute par défaut sur http://localhost:5173

- Le frontend appelle maintenant l’API via `/api/generate`.
- Un proxy Vite redirige `/api` vers le backend (cible: `http://localhost:3000`).

## Démarrage via Docker (client + serveur)

Assurez-vous que `server/.env` contient votre clé OpenAI.

```
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Le proxy Vite pointe automatiquement sur `http://server:3000` en mode Docker.

Pour arrêter:
```
docker compose down
```

## Dépannage: erreur "self-signed certificate in certificate chain"

Si vous voyez dans les logs du serveur une erreur comme:

```
FetchError: request to https://api.openai.com/v1/chat/completions failed, reason: self-signed certificate in certificate chain
```

Cela survient souvent en développement si vous êtes derrière un proxy HTTPS qui réémet des certificats autosignés (ex: certains proxys d'entreprise) ou si une inspection TLS est active.

Solutions:
- Développement rapide (non sécurisé): exporter la variable d'environnement `NODE_TLS_REJECT_UNAUTHORIZED=0` pour désactiver la vérification TLS dans Node.js. Le `docker-compose.yml` inclus dans ce projet active cette variable uniquement pour le service `server` (convenience en dev). Ne laissez pas cette option en production.
- Solution sécurisée (recommandée): importer le certificat racine de votre proxy/CA dans l'image Docker afin que Node valide correctement la chaîne. Exemple pour les images basées sur Debian/Ubuntu:

```dockerfile
# Dockerfile (extrait): copier votre CA et mettre à jour le store
COPY my-root-ca.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
```

Pour l'image Alpine (utilisée ici), vous pouvez plutôt:

```dockerfile
COPY my-root-ca.crt /usr/local/share/ca-certificates/my-root-ca.crt
RUN apk add --no-cache ca-certificates && update-ca-certificates
```

Après cela, rebuild l'image et relancez `docker compose up --build`.

Si vous préférez, vous pouvez aussi exécuter l'application hors Docker depuis votre machine (avec vos CA système déjà installés) pour contourner le problème pendant le développement.

## Notes
- Pour réduire davantage les coûts:
  - Diminuer PAGE_COUNT (ex: 4)
  - Diminuer IMAGE_SIZE (ex: 256x256)
  - Utiliser un cache local pour le dev (non inclus dans ce MVP)
- Si la photo n’est pas fournie, la couverture affichera un titre coloré.
- Le texte est généré en français, style enfantin, 2–3 phrases par page.

## Thèmes d’exemple
- Espace, Forêt magique, Pirates, Super-héros, Licornes