#!/usr/bin/env node
/**
 * Ensure DIRECT_URL is set (fallback to DATABASE_URL) then run prisma migrate deploy.
 * Avoids Vercel P1012 when DIRECT_URL is missing or empty.
 */
const { spawnSync } = require('child_process')

const env = { ...process.env }
if (!env.DIRECT_URL || !String(env.DIRECT_URL).trim()) {
  env.DIRECT_URL = env.DATABASE_URL || ''
}

if (!env.DATABASE_URL || !String(env.DATABASE_URL).trim()) {
  console.error(
    '[migrate] DATABASE_URL manquant. Ajoute-le dans Vercel → Settings → Environment Variables.',
  )
  process.exit(1)
}

const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

process.exit(result.status === null ? 1 : result.status)
