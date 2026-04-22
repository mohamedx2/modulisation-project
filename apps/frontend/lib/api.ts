import { getSession, signOut } from 'next-auth/react';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = null;

  if (typeof window !== 'undefined') {
    const session: any = await getSession();
    if (session?.error === "RefreshAccessTokenError") {
      signOut();
      throw new Error("Session expired");
    }
    token = session?.accessToken;
  } else {
    // Server-side
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
    const session: any = await getServerSession(authOptions);
    if (session?.error === "RefreshAccessTokenError") {
      throw new Error("Session expired");
    }
    token = session?.accessToken;
  }

  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        signOut();
      }
      console.error('Unauthorized response');
    }
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
