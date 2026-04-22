import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import CredentialsProvider from "next-auth/providers/credentials";

async function refreshAccessToken(token: any) {
  try {
    const keycloakUrl = process.env.KEYCLOAK_INTERNAL_URL || process.env.KEYCLOAK_ISSUER || "http://127.0.0.1:8080/realms/master";
    const tokenUrl = `${keycloakUrl}/protocol/openid-connect/token`;

    const params = new URLSearchParams({
      client_id: process.env.KEYCLOAK_ID || "frontend",
      client_secret: process.env.KEYCLOAK_SECRET || "secret",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error("Error refreshing Access Token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || "frontend",
      clientSecret: process.env.KEYCLOAK_SECRET || "secret",
      // NextAuth matches the token internally with the `issuer` returned by the server. 
      // The server openid-configuration returns issuer as "http://keycloak:8080/realms/master"
      // So we must use THAT exact string as issuer here, and then manually override the external authorization URL.
      issuer: process.env.KEYCLOAK_INTERNAL_URL || "http://keycloak:8080/realms/master",
      authorization: {
        url: `${process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/master"}/protocol/openid-connect/auth`,
        params: { scope: "openid email profile" },
      },
    }),
    CredentialsProvider({
      name: "Keycloak Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        try {
          // Use internal docker hostname if available, else localhost
          const keycloakUrl = process.env.KEYCLOAK_INTERNAL_URL || process.env.KEYCLOAK_ISSUER || "http://127.0.0.1:8080/realms/master";
          const tokenUrl = `${keycloakUrl}/protocol/openid-connect/token`;
          
          const params = new URLSearchParams({
            client_id: process.env.KEYCLOAK_ID || "frontend",
            client_secret: process.env.KEYCLOAK_SECRET || "secret",
            grant_type: "password",
            username: credentials.username,
            password: credentials.password,
          });

          const response = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
          });

          const tokens = await response.json();

          if (!response.ok) {
            console.error("Keycloak auth error:", response.status, tokens);
            throw new Error("Failed to authenticate");
          }

          // Return a mock user object with the token
          return {
            id: credentials.username,
            name: credentials.username,
            // Pass the access token to the JWT callback
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          } as any;
        } catch (e) {
          return null;
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token || (user as any).access_token,
          refreshToken: account.refresh_token || (user as any).refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 5 * 60 * 1000,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
