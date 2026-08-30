export function splitName(name: string | null | undefined): { firstName: string; lastName: string } {
  const trimmed = (name || '').trim()
  if (!trimmed) return { firstName: '', lastName: '' }
  const space = trimmed.indexOf(' ')
  if (space === -1) return { firstName: trimmed, lastName: '' }
  return { firstName: trimmed.slice(0, space), lastName: trimmed.slice(space + 1).trim() }
}

export function displayParts(user: {
  firstName?: string | null
  lastName?: string | null
  name?: string | null
}): { firstName: string; lastName: string } {
  const first = (user.firstName || '').trim()
  const last = (user.lastName || '').trim()
  if (first || last) return { firstName: first, lastName: last }
  return splitName(user.name)
}

export function fullName(firstName?: string | null, lastName?: string | null, fallback?: string | null) {
  const joined = [firstName, lastName]
    .map((part) => (part || '').trim())
    .filter(Boolean)
    .join(' ')
  return joined || fallback?.trim() || null
}
