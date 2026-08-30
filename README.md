# Sign Platform

Next.js — traduction vers la langue des signes (avatars 3D), auth NextAuth, Prisma/Postgres.

## Dev local

1. Postgres (Docker) : `docker compose up -d`  
   ou [Neon](https://console.neon.tech) (gratuit) — copier l’URL dans `.env`
2. `cp .env.example .env` puis renseigner les secrets
3. `npm install`
4. `npx prisma migrate deploy && npm run db:seed`
5. `npm run dev` → http://localhost:3000

## Déploiement Vercel (checklist)

### 1. Base Postgres (Neon)
1. Créer un projet sur https://console.neon.tech
2. Copier **pooled** → `DATABASE_URL` et **direct** → `DIRECT_URL` (sslmode=require)

### 2. GitHub
Pousser ce repo sur `origin` (`main`).

### 3. Projet Vercel
1. https://vercel.com/new → importer le repo
2. Framework : Next.js (détecté)
3. Build : `npm run vercel-build` (déjà dans `vercel.json`)

### 4. Variables d’environnement (Production)
| Variable | Exemple / note |
|----------|----------------|
| `DATABASE_URL` | Neon pooled |
| `DIRECT_URL` | Neon direct |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://xxx.vercel.app` puis ton domaine |
| `NEXT_PUBLIC_SIGNS_CDN` | URL R2 des signes |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | mails |
| `ADMIN_EMAIL` | destinataire des demandes |
| `ADMIN_SECRET` | secret liens approve (ou = NEXTAUTH_SECRET) |
| `PROTECTED_ADMIN_EMAIL` | admin non supprimable |
| `NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL` | idem côté UI |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | seed au premier setup |
| `ANTHROPIC_API_KEY` | optionnel (synonymes) |

### 5. Après le 1er deploy
```bash
# depuis ta machine, avec DATABASE_URL prod :
npx prisma migrate deploy
npm run db:seed
```
(ou laisser `vercel-build` faire `migrate deploy` à chaque build)

### 6. Domaine
Vercel → Domains → ajouter le domaine → DNS chez le registrar → mettre à jour `NEXTAUTH_URL` → redeploy.

### 7. Tests
Landing, register, mail approve, login, traduction avatar, upload PDF, panneau admin.

## Sécu intégrée
- Rate limit (register / login / segment / upload / translate)
- Mots de passe ≥ 10 + lettre + chiffre
- Honeypot anti-bot inscription
- Middleware auth sur `/dashboard` et `/admin`
- Headers HSTS / CSP / nosniff
- Comptes en attente d’approbation admin
