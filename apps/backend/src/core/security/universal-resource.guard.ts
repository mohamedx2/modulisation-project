import {
  Injectable,
  ExecutionContext,
  Inject,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ResourceGuard,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_LOGGER,
  KEYCLOAK_MULTITENANT_SERVICE,
} from 'nest-keycloak-connect';

@Injectable()
export class UniversalResourceGuard extends ResourceGuard {
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

    // If we have a Keycloak JWT, use the standard ResourceGuard
    if (request.accessTokenJWT) {
      return super.canActivate(context);
    }

    // Local Fallback: For local users, we treat ResourceGuard as permissive 
    // since we don't have a local Policy Enforcer yet.
    if (request.user && !request.accessTokenJWT) {
      return true;
    }

    return super.canActivate(context);
  }
}
