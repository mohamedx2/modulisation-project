import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.cookies?.user_id;
    const accessToken = request.cookies?.access_token;

    if (!userId || !accessToken) {
      throw new UnauthorizedException('Not authenticated');
    }

    (request as any).userId = parseInt(userId, 10);
    return true;
  }
}