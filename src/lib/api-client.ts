const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options
  const res = await fetch(`${API_BASE}/api${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  })

  if (!res.ok) {
    const error = await res.text().catch(() => `HTTP ${res.status}`)
    throw new Error(error)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}
