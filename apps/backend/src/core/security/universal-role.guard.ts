import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class UniversalRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('[UniversalRoleGuard] Path:', request.url);
    console.log('[UniversalRoleGuard] User:', user ? JSON.stringify({ sub: user.sub, roles: user.realm_access?.roles }) : 'null');
    console.log('[UniversalRoleGuard] accessTokenJWT:', !!request.accessTokenJWT);

    if (!user) {
      console.warn('[UniversalRoleGuard] No user on request - DENIED');
      return false;
    }

    const rolesData = this.reflector.getAllAndMerge('roles', [
      context.getClass(),
      context.getHandler(),
    ]);

    console.log('[UniversalRoleGuard] Raw rolesData:', JSON.stringify(rolesData));

    if (!rolesData) {
      console.log('[UniversalRoleGuard] No @Roles decorator - ALLOWED');
      return true;
    }

    const rolesArray = Array.isArray(rolesData) ? rolesData : [rolesData];
    const requiredRoles = rolesArray.flatMap((r: any) => r?.roles || []);

    console.log('[UniversalRoleGuard] Required roles:', requiredRoles);

    if (requiredRoles.length === 0) {
      console.log('[UniversalRoleGuard] Empty required roles - ALLOWED');
      return true;
    }

    const userRoles: string[] = user.realm_access?.roles || [];
    const userRolesLower = userRoles.map((r: string) => r.toLowerCase());

    const hasRole = requiredRoles.some((role: string) => {
      const roleBase = role.replace(/^realm:/i, '').toLowerCase();

      const match = 
        userRoles.includes(role) ||
        userRoles.includes(role.toLowerCase()) ||
        userRoles.includes(role.toUpperCase()) ||
        userRolesLower.includes(role.toLowerCase()) ||
        userRolesLower.includes(roleBase) ||
        userRoles.map((r: string) => r.toLowerCase()).includes(roleBase);
      
      if (match) {
        console.log(`[UniversalRoleGuard] Role match: "${role}" (base: "${roleBase}") found in user roles`);
      }
      return match;
    });

    if (!hasRole) {
      console.warn(`[UniversalRoleGuard] DENIED. User has: [${userRoles.join(', ')}]. Required: [${requiredRoles.join(', ')}]`);
    } else {
      console.log('[UniversalRoleGuard] ALLOWED');
    }

    return hasRole;
  }
}
