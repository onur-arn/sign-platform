import type { TranslationKeys } from '@/lib/i18n/translations'

/** Codes renvoyés par authorize() — traduits côté client. */
export const AuthErrorCode = {
  CREDENTIALS_REQUIRED: 'CREDENTIALS_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  RATE_LIMITED: 'RATE_LIMITED',
  ACCOUNT_PENDING: 'ACCOUNT_PENDING',
  ACCOUNT_REJECTED: 'ACCOUNT_REJECTED',
} as const

export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode]

const CODE_TO_KEY: Record<string, keyof TranslationKeys['auth']> = {
  [AuthErrorCode.CREDENTIALS_REQUIRED]: 'credentialsRequired',
  [AuthErrorCode.INVALID_CREDENTIALS]: 'invalidCredentials',
  [AuthErrorCode.RATE_LIMITED]: 'rateLimited',
  [AuthErrorCode.ACCOUNT_PENDING]: 'accountPending',
  [AuthErrorCode.ACCOUNT_REJECTED]: 'accountRejected',
  // NextAuth générique
  CredentialsSignin: 'invalidCredentials',
  // Anciens messages FR (sessions / cache)
  'Email et mot de passe requis': 'credentialsRequired',
  'Email ou mot de passe incorrect': 'invalidCredentials',
  'Trop de tentatives. Réessayez dans quelques minutes.': 'rateLimited',
  "Votre compte est en attente de validation par l'administrateur.": 'accountPending',
  "Votre demande d'inscription a été refusée.": 'accountRejected',
}

export function translateAuthError(
  error: string | undefined | null,
  auth: TranslationKeys['auth'],
): string {
  if (!error) return auth.errorOccurred
  const key = CODE_TO_KEY[error]
  if (key) return auth[key] as string
  // Parfois NextAuth URL-encode / ajoute un préfixe
  for (const [code, k] of Object.entries(CODE_TO_KEY)) {
    if (error.includes(code)) return auth[k] as string
  }
  return auth.errorOccurred
}
