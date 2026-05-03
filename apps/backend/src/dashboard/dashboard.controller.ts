import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
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

  @Get('admin/stats')
  @Roles({ roles: ['realm:admin', 'realm:SUPER_ADMIN'] })
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('admin/users')
  @Roles({ roles: ['realm:admin', 'realm:SUPER_ADMIN'] })
  getAllUsers() {
    return this.dashboardService.getAllUsers();
  }

  @Patch('admin/users/:id/role')
  @Roles({ roles: ['realm:admin', 'realm:SUPER_ADMIN'] })
  updateUserRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.dashboardService.updateUserRole(id, body.role);
  }

  @Delete('admin/users/:id')
  @Roles({ roles: ['realm:admin', 'realm:SUPER_ADMIN'] })
  deleteUser(@Param('id') id: string) {
    return this.dashboardService.deleteUser(id);
  }
}
