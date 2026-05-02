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
    const errorData = await response.json().catch(() => ({}));
    let message = errorData.message || `API error: ${response.status}`;
    if (Array.isArray(message)) {
      message = message.join(', ');
    } else if (typeof message === 'object' && message.message) {
      message = Array.isArray(message.message) ? message.message.join(', ') : message.message;
    }
    console.error('API error:', response.status, message);
    const error = new Error(message as string);
    (error as any).statusCode = response.status;
    (error as any).data = errorData;
    throw error;
  }

  if (options.headers && new Headers(options.headers).get('Accept') === 'text/csv') {
    return response.text();
  }

  return response.json();
}