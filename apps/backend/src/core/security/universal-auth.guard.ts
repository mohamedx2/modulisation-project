import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AuthGuard,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_LOGGER,
  KEYCLOAK_MULTITENANT_SERVICE,
} from 'nest-keycloak-connect';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UniversalAuthGuard extends AuthGuard {
  constructor(
    @Inject(KEYCLOAK_INSTANCE) keycloak: any,
    @Inject(KEYCLOAK_CONNECT_OPTIONS) keycloakOpts: any,
    @Inject(KEYCLOAK_LOGGER) private readonly _logger: Logger,
    @Inject(KEYCLOAK_MULTITENANT_SERVICE) multiTenant: any,
    reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {
    super(keycloak, keycloakOpts, _logger, multiTenant, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('[UniversalAuthGuard] Path:', request.url);
    console.log('[UniversalAuthGuard] Cookies:', JSON.stringify({
      access_token: request.cookies?.access_token ? 'present' : 'missing',
      user_id: request.cookies?.user_id ? 'present' : 'missing',
    }));

    // 1. Try Keycloak validation first
    try {
      console.log('[UniversalAuthGuard] Attempting Keycloak authentication...');
      const result = await super.canActivate(context);
      console.log('[UniversalAuthGuard] Keycloak canActivate returned:', result);
      
      if (result && request.user) {
        console.log('[UniversalAuthGuard] Keycloak user:', JSON.stringify({
          sub: request.user?.sub,
          roles: request.user?.realm_access?.roles,
        }));

        // Enrich with local DB role
        try {
          const keycloakSub = request.user?.sub;
          const keycloakEmail = request.user?.email;
          
          let localUser = null;
          if (keycloakSub) {
            localUser = await this.prisma.user.findUnique({
              where: { id: keycloakSub, deletedAt: null },
            });
          }
          // Fallback: find by email
          if (!localUser && keycloakEmail) {
            localUser = await this.prisma.user.findUnique({
              where: { email: keycloakEmail, deletedAt: null },
            });
          }

          if (localUser) {
            console.log('[UniversalAuthGuard] Found local user:', localUser.email, 'role:', localUser.role);
            const roleLower = localUser.role.toLowerCase();
            const roleUpper = localUser.role.toUpperCase();

            const existingRoles = request.user?.realm_access?.roles || [];
            const mergedRoles = new Set(existingRoles);

            mergedRoles.add(roleLower);
            mergedRoles.add(roleUpper);
            mergedRoles.add(`realm:${roleLower}`);
            mergedRoles.add(`realm:${roleUpper}`);
            mergedRoles.add('realm:default-roles-reno');

            if (roleLower === 'admin' || roleLower === 'super_admin') {
              mergedRoles.add('realm:SUPER_ADMIN');
              mergedRoles.add('realm:super_admin');
              mergedRoles.add('SUPER_ADMIN');
              mergedRoles.add('ADMIN');
            }

            request.user.realm_access = { roles: Array.from(mergedRoles) };
            console.log('[UniversalAuthGuard] Enriched roles:', request.user.realm_access.roles);
          } else {
            console.log('[UniversalAuthGuard] No local DB user found for sub:', keycloakSub, 'or email:', keycloakEmail);
          }
        } catch (enrichErr) {
          console.warn('[UniversalAuthGuard] DB enrichment failed:', enrichErr.message);
        }

        return true;
      }
    } catch (e) {
      console.warn('[UniversalAuthGuard] Keycloak auth failed:', e.message);
    }

    // 2. Local Fallback: Check cookies for user_id
    try {
      const userId = request.cookies?.user_id;
      if (userId) {
        console.log('[UniversalAuthGuard] Local fallback: user_id cookie:', userId);
        const user = await this.prisma.user.findUnique({
          where: { id: userId, deletedAt: null },
        });

        if (user) {
          console.log('[UniversalAuthGuard] Local user found:', user.email, 'role:', user.role);
          const roleLower = user.role.toLowerCase();
          const roleUpper = user.role.toUpperCase();

          const roles = [
            roleLower,
            roleUpper,
            `realm:${roleLower}`,
            `realm:${roleUpper}`,
            'realm:default-roles-reno',
          ];

          if (roleLower === 'admin' || roleLower === 'super_admin') {
            roles.push('realm:SUPER_ADMIN', 'realm:super_admin', 'SUPER_ADMIN', 'ADMIN');
          }

          request.user = {
            sub: user.id,
            email: user.email,
            name: user.name,
            tenantId: user.tenantId || 'default-tenant-id',
            realm_access: { roles },
          };
          return true;
        }
      }
    } catch (dbError) {
      console.error('[UniversalAuthGuard] DB fallback failed:', dbError.message);
      throw dbError;
    }

    console.warn('[UniversalAuthGuard] Authentication failed');
    throw new UnauthorizedException('Not authenticated');
  }
}
