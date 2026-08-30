# Sign Platform

Plateforme web de **traduction vers la langue des signes** via des **avatars 3D**.  
Texte, voix ou PDF → segmentation lexicale → animation des signes.

Projet porté pour une communication plus inclusive (sourds, malentendants, difficultés à l’écrit).

---

## Fonctionnalités

- **Traduire** — saisie texte / reconnaissance vocale → avatar 3D
- **Documents** — upload PDF, extraction de texte, traduction
- **Dictionnaire** — recherche de signes (FR / EN / TR / PL)
- **Studio avatar** — choix d’avatars internationaux
- **Inscription contrôlée** — comptes en attente d’approbation admin (email)
- **Panneau admin** — validation, rôles, stats
- **i18n** — français, anglais, turc, polonais
- **Mode sombre** / clair

---

## Stack

| Couche | Techno |
|--------|--------|
| App | Next.js 16 (App Router), React 19, TypeScript |
| UI 3D | Three.js, React Three Fiber / Drei |
| Auth | NextAuth (credentials + JWT) |
| Base | PostgreSQL + Prisma |
| Mails | Nodemailer (SMTP) |
| Signes | CDN (Cloudflare R2) — JSON d’animation |
| Déploiement | Vercel |

---

## Prérequis

- Node.js 20+
- PostgreSQL (Docker local **ou** [Neon](https://console.neon.tech))
- Compte SMTP (ex. Gmail + mot de passe d’application)

---

## Installation locale

```bash
git clone https://github.com/onur-arn/sign-platform.git
cd sign-platform
cp .env.example .env
```

### 1. Base de données

**Option A — Docker**

```bash
docker compose up -d
```

Les valeurs par défaut de `.env.example` pointent déjà vers `localhost:5432`.

**Option B — Neon**

Créer un projet Neon, puis renseigner dans `.env` :

- `DATABASE_URL` → connexion **pooled**
- `DIRECT_URL` → connexion **directe**

### 2. Variables à renseigner

Au minimum :

```env
NEXTAUTH_SECRET=   # openssl rand -base64 32
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=   # ≥ 10 car., lettre + chiffre
PROTECTED_ADMIN_EMAIL=
NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL=
ADMIN_EMAIL=
SMTP_USER=
SMTP_PASS=
```

Optionnel : `ANTHROPIC_API_KEY` (synonymes IA), `NEXT_PUBLIC_SIGNS_CDN`.

### 3. Installer, migrer, lancer

```bash
npm install
npm run db:setup    # migrate + seed admin
npm run dev         # http://localhost:3000
```

> Sur macOS Intel, le script `dev` utilise Webpack (`next dev --webpack`) : Turbopack n’y est pas supporté.

---

## Scripts npm

| Commande | Rôle |
|----------|------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production local |
| `npm run start` | Lancer le build |
| `npm run db:migrate` | Appliquer les migrations Prisma |
| `npm run db:seed` | Créer / maj le compte admin |
| `npm run db:setup` | migrate + seed |
| `npm run vercel-build` | Build Vercel (generate + migrate + build) |

---

## Structure du projet

```
app/                 # Pages & API routes
components/          # UI, avatars 3D, vues dashboard
contexts/            # Langue, etc.
hooks/               # Speech recognition, …
lib/                 # Auth, Prisma, i18n, rate-limit, lexique
prisma/              # Schema, migrations, seed
public/              # Assets, worker PDF, logos
middleware.ts        # Protection /dashboard & /admin
vercel.json          # Config déploiement
docker-compose.yml   # Postgres local
```

---

## Déploiement (Vercel)

1. **Neon** — créer la base, récupérer `DATABASE_URL` + `DIRECT_URL`
2. **Vercel** — importer le repo GitHub `onur-arn/sign-platform`
3. Coller les **variables d’environnement** (Production) :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon pooled |
| `DIRECT_URL` | Neon direct |
| `NEXTAUTH_SECRET` | Secret fort (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://….vercel.app` puis ton domaine |
| `NEXT_PUBLIC_SIGNS_CDN` | URL CDN des signes |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Emails |
| `ADMIN_EMAIL` | Destinataire des demandes d’inscription |
| `ADMIN_SECRET` | Signature des liens d’approbation |
| `PROTECTED_ADMIN_EMAIL` | Admin non supprimable |
| `NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL` | Idem (UI) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Compte admin initial |
| `ANTHROPIC_API_KEY` | Optionnel |

4. Deploy — le build exécute `npm run vercel-build` (migrations incluses)
5. Si besoin : `npm run db:seed` une fois avec l’URL prod
6. **Domaine** — Vercel → Domains → DNS → mettre à jour `NEXTAUTH_URL` → redeploy

### Checklist de test post-deploy

- [ ] Landing + changement de langue  
- [ ] Inscription → email admin → approve / reject  
- [ ] Login → Traduire (texte / voix)  
- [ ] Upload PDF  
- [ ] Dictionnaire + studio avatar  
- [ ] Panneau admin  

---

## Sécurité

- Rate limiting (inscription, login, segment, upload, traduction)
- Mots de passe ≥ 10 caractères, lettre + chiffre
- Honeypot anti-bot à l’inscription
- Comptes `PENDING` jusqu’à validation admin
- Middleware sur `/dashboard` et `/admin`
- Headers HSTS, CSP, `X-Frame-Options`, `nosniff`
- Mots de passe hashés (bcrypt)

Ne jamais committer le fichier `.env`.

---

## Licence / crédits

Projet associatif — partenaires & crédits visibles dans l’onglet **Information** de l’application.
