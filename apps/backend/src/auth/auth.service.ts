import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) { }

  async login(username: string, password: string, res: Response) {
    const keycloakUrl = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
    const realm = process.env.KEYCLOAK_REALM || 'reno';
    const clientId = process.env.KEYCLOAK_CLIENT_ID || 'backend';
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET || 'lgLCI4KGNki1p8ULBt7l5A4zCE0kTIb6';

    const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

    try {
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'password',
        username,
        password,
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (response.ok) {
        const tokens = await response.json();
        const jwtPayload = JSON.parse(Buffer.from(tokens.access_token.split('.')[1], 'base64').toString());

        const user = await this.prisma.user.upsert({
          where: { email: username.includes('@') ? username : `${username}@reno.com` },
          update: { name: username },
          create: {
            id: jwtPayload.sub,
            email: username.includes('@') ? username : `${username}@reno.com`,
            name: username,
            password: 'authenticated',
          },
        });

        this.setCookies(res, tokens, user.id);

        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        };
      }
    } catch (error) {
      console.error('Keycloak login failed, attempting local fallback:', error.message);
    }

    // Fallback: Local Database Authentication
    const localUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { email: `${username}@reno.com` }
        ]
      }
    });

    if (localUser && localUser.password && localUser.password !== 'authenticated' && localUser.password !== 'keycloak-managed') {
      const isPasswordValid = await bcrypt.compare(password, localUser.password);
      if (isPasswordValid) {
        // Generate a mock JWT for session consistency if needed, 
        // but for now we'll just set a session cookie or user_id
        res.cookie('user_id', localUser.id, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return {
          user: {
            id: localUser.id,
            name: localUser.name,
            email: localUser.email,
            role: localUser.role,
          },
        };
      }
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  private setCookies(res: Response, tokens: any, userId: string) {
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in * 1000,
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie('user_id', userId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  async logout(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('user_id');
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async getOrCreateFromJwt(
    payload: Record<string, any>,
    res: Response,
  ) {
    const email: string =
      payload.email ||
      `${payload.preferred_username}@reno.com`;
    const name: string =
      payload.name ||
      payload.preferred_username ||
      email;

    const user = await this.prisma.user.upsert({
      where: { email },
      update: { name },
      create: {
        id: payload.sub,
        email,
        name,
        password: 'keycloak-managed',
      },
    });

    // Keep user_id cookie in sync with the Prisma record
    res.cookie('user_id', user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async refreshTokens(refreshToken: string, res: Response) {
    const keycloakUrl = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
    const realm = process.env.KEYCLOAK_REALM || 'reno';

    const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

    const params = new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID || 'backend',
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET || 'lgLCI4KGNki1p8ULBt7l5A4zCE0kTIb6',
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokens = await response.json();

    if (!response.ok) {
      throw new UnauthorizedException('Session expired');
    }

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in * 1000,
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { success: true };
  }
}