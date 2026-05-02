import {
  Injectable,
  ExecutionContext,
  Inject,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  RoleGuard,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_LOGGER,
  KEYCLOAK_MULTITENANT_SERVICE,
} from 'nest-keycloak-connect';

@Injectable()
export class UniversalRoleGuard extends RoleGuard {
  constructor(
    @Inject(KEYCLOAK_INSTANCE) keycloak: any,
    @Inject(KEYCLOAK_CONNECT_OPTIONS) keycloakOpts: any,
    @Inject(KEYCLOAK_LOGGER) private readonly _logger: Logger,
    @Inject(KEYCLOAK_MULTITENANT_SERVICE) multiTenant: any,
    private readonly _reflector: Reflector,
  ) {
    super(keycloak, keycloakOpts, _logger, multiTenant, _reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // If we have a Keycloak JWT, use the standard RoleGuard
    if (request.accessTokenJWT) {
      return super.canActivate(context);
    }

    // Local Fallback: If we have a mock user populated by UniversalAuthGuard
    if (request.user && !request.accessTokenJWT) {
      try {
        // Logic from RoleGuard: get roles from decorators
        const rolesData = this._reflector.getAllAndMerge('roles', [
          context.getClass(),
          context.getHandler(),
        ]);

        if (!rolesData) {
          return true;
        }

        const rolesArray = Array.isArray(rolesData) ? rolesData : [rolesData];
        const userRoles = request.user.realm_access?.roles || [];
        const requiredRoles = rolesArray.flatMap((r: any) => r?.roles || []);

        this._logger.verbose(`Checking roles for local user. User roles: ${userRoles.join(', ')}. Required: ${requiredRoles.join(', ')}`);

        // Simple matching: ANY of the required roles
        const hasRole = requiredRoles.some((role: string) => 
          userRoles.includes(role) || 
          userRoles.includes(role.toLowerCase()) ||
          userRoles.map((ur: string) => ur.toLowerCase()).includes(role.toLowerCase())
        );

        if (hasRole) {
          this._logger.verbose(`Local resource granted due to role(s)`);
          return true;
        }

        this._logger.verbose(`Local resource denied due to mismatched role(s)`);
        return false;
      } catch (err) {
        this._logger.error(`Local role check crashed: ${err.message}`, err.stack);
        return false; // Fail safe
      }
    }

    return super.canActivate(context);
  }
}
