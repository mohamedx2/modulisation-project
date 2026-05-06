import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class UniversalResourceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    console.log('[UniversalResourceGuard] Path:', request.url, '- ALLOWED');
    return true;
  }
}
