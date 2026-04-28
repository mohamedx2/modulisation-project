import { Controller, Post, Get, Body, Res, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Unprotected } from 'nest-keycloak-connect';

@Controller('auth')
@Unprotected()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.login(body.username, body.password, res);
      return res.json(result);
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    const result = await this.authService.logout(res);
    return res.json(result);
  }

  @Get('session')
  async getSession(@Req() req: Request, @Res() res: Response) {
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      return res.status(200).json({ authenticated: false });
    }

    try {
      // Decode JWT payload (issued by our Keycloak instance)
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        return res.status(200).json({ authenticated: false });
      }
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf-8'),
      );

      // Check token expiry
      if (!payload.exp || payload.exp < Date.now() / 1000) {
        return res.status(200).json({ authenticated: false });
      }

      // Get or create the user in DB from JWT claims
      const user = await this.authService.getOrCreateFromJwt(payload, res);
      return res.json({ authenticated: true, user });
    } catch {
      return res.status(200).json({ authenticated: false });
    }
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    try {
      await this.authService.refreshTokens(refreshToken, res);
      return res.json({ success: true });
    } catch {
      throw new UnauthorizedException('Session expired');
    }
  }
}