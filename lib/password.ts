/** Règles mot de passe prod : 10+ caractères, lettre + chiffre */
export const PASSWORD_MIN_LENGTH = 10

export type PasswordCheck =
  | { ok: true }
  | { ok: false; code: 'PASSWORD_SHORT' | 'PASSWORD_WEAK' }

export function validatePassword(password: string): PasswordCheck {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, code: 'PASSWORD_SHORT' }
  }
  if (!/[A-Za-zÀ-ÿ]/.test(password) || !/[0-9]/.test(password)) {
    return { ok: false, code: 'PASSWORD_WEAK' }
  }
  return { ok: true }
}
