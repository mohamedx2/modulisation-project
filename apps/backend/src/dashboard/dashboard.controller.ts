import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { KeycloakUser } from '../core/security/keycloak-user.interface';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles({ roles: ['realm:user', 'realm:admin'] })
  getStats(@AuthenticatedUser() user: KeycloakUser) {
    return this.dashboardService.getStats();
  }
}
