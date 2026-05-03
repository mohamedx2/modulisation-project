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
    this._logger.verbose(`Checking authentication for path: ${request.url}`);

    // 1. Try Keycloak validation first
    try {
      this._logger.verbose('Attempting Keycloak authentication...');
      const result = await super.canActivate(context);
      if (result) {
        this._logger.verbose('Keycloak authentication successful');
        return true;
      }
    } catch (e) {
      this._logger.warn(`Keycloak auth failed: ${e.message}`);
      // If it's a 401/403, we continue to local check. 
      // If it's something else, we might want to know.
    }

    // 2. Local Fallback: Check cookies for user_id
    try {
      const userId = request.cookies?.user_id;
      if (userId) {
        this._logger.verbose(`Found user_id cookie: ${userId}, checking database...`);
        const user = await this.prisma.user.findUnique({
          where: { id: userId, deletedAt: null },
        });

        if (user) {
          this._logger.verbose(`Local user found: ${user.email} (${user.role})`);
          const roleLower = user.role.toLowerCase(); // e.g. 'admin'
          const roleUpper = user.role.toUpperCase(); // e.g. 'ADMIN'

          // Build a comprehensive set of role aliases so this user matches
          // any @Roles() decorator variation used across the controllers.
          const roles = [
            roleLower,                  // 'admin'
            roleUpper,                  // 'ADMIN'
            `realm:${roleLower}`,       // 'realm:admin'
            `realm:${roleUpper}`,       // 'realm:ADMIN'
            'realm:default-roles-reno', // Keycloak default role
          ];

          // ADMIN users also get SUPER_ADMIN so they can pass any admin check
          if (roleLower === 'admin') {
            roles.push('realm:SUPER_ADMIN', 'realm:super_admin', 'SUPER_ADMIN');
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
        this._logger.verbose('No local user found for this user_id');
      }
    } catch (dbError) {
      this._logger.error(`Database fallback failed: ${dbError.message}`, dbError.stack);
      throw dbError; // Rethrow DB errors as they are real 500s
    }

    this._logger.verbose('Authentication failed: No valid Keycloak token or local session');
    throw new UnauthorizedException('Not authenticated');
  }
}
