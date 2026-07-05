import { env } from '@/constants/env'

type RequestOptions = RequestInit & {
  baseUrl?: string
}

export async function requestJson<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const baseUrl = options.baseUrl ?? env.apiBaseUrl
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json() as Promise<TResponse>
}
