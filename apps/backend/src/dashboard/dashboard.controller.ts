import { Controller, Get, Post, Body } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { KeycloakUser } from '../core/security/keycloak-user.interface';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  getStats(@AuthenticatedUser() user: KeycloakUser) {
    return this.dashboardService.getStats(user.tenantId || 'default-tenant-id');
  }

  @Get('vehicles')
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  getVehicles(@AuthenticatedUser() user: KeycloakUser) {
    return this.dashboardService.getVehicles(user.tenantId || 'default-tenant-id');
  }

  @Post('vehicles')
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  createVehicle(
    @AuthenticatedUser() user: KeycloakUser,
    @Body() body: { name: string; plate: string; img?: string },
  ) {
    return this.dashboardService.createVehicle(
      user.tenantId || 'default-tenant-id',
      body,
    );
  }
}
