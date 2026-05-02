export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const baseUrl = typeof window === 'undefined' 
    ? (process.env.NEXT_PUBLIC_DASHBOARD_API || 'http://backend:3001')
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    console.error('API error:', response.status);
    throw new Error(`API error: ${response.status}`);
  }

  if (options.headers && new Headers(options.headers).get('Accept') === 'text/csv') {
    return response.text();
  }

  return response.json();
}