function readEnvValue(value: string | undefined) {
  return value?.trim() || undefined
}

const supabaseUrl = readEnvValue(import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/+$/, '')
const supabaseAnonKey = readEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseAnonKey.split('.').length === 3)
}

function headers(prefer?: string) {
  if (!supabaseAnonKey) {
    return {}
  }

  return {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured')
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, options)
  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`)
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

export async function supabaseSelect<T>(table: string, query = 'select=*') {
  return request<T[]>(`${table}?${query}`, {
    method: 'GET',
    headers: headers(),
  })
}

export async function supabaseInsert(table: string, payload: unknown) {
  return request<void>(table, {
    method: 'POST',
    headers: headers('return=minimal'),
    body: JSON.stringify(payload),
  })
}

export async function supabaseUpsert(table: string, payload: unknown) {
  return request<void>(table, {
    method: 'POST',
    headers: headers('resolution=merge-duplicates,return=minimal'),
    body: JSON.stringify(payload),
  })
}

export async function supabaseUpdate(table: string, id: string, payload: unknown) {
  return request<void>(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: headers('return=minimal'),
    body: JSON.stringify(payload),
  })
}

export async function supabaseDelete(table: string, id: string) {
  return request<void>(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: headers('return=minimal'),
  })
}
