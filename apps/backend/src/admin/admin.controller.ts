import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { KeycloakUser } from '../core/security/keycloak-user.interface';
import { TicketsService } from '../tickets/tickets.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { PaymentsService } from '../payments/payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Controller('admin')
@UseGuards(ThrottlerGuard)
export class AdminController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly vehiclesService: VehiclesService,
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Get('dashboard')
  @Roles({ roles: ['realm:admin', 'realm:SUPER_ADMIN', 'realm:ADMIN'] })
  async getDashboardStats(@AuthenticatedUser() user: KeycloakUser) {
    const [tickets, vehicles, payments, usersCount] = await Promise.all([
      this.ticketsService.findAllAdmin(),
      this.vehiclesService.findAllAdmin(),
      this.paymentsService.findAllAdmin(),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    const activeTickets = tickets.filter(t => t.status !== 'CLOSED' && !t.deletedAt);
    const totalRevenue = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      stats: {
        totalTickets: tickets.length,
        activeTickets: activeTickets.length,
        totalVehicles: vehicles.length,
        totalUsers: usersCount,
        totalRevenue,
        pendingPayments: payments.filter(p => p.status === 'PENDING').length,
      },
      recentTickets: tickets.slice(0, 10),
      recentPayments: payments.slice(0, 10),
    };
  }

  @Get('tickets')
  @Roles({ roles: ['realm:admin', 'realm:SUPER_ADMIN', 'realm:ADMIN'] })
  async getAllTickets() {
    return this.ticketsService.findAllAdmin();
  }

  @Get('vehicles')
  @Roles({ roles: ['realm:admin', 'realm:SUPER_ADMIN', 'realm:ADMIN'] })
  async getAllVehicles() {
    return this.vehiclesService.findAllAdmin();
  }

  @Get('payments')
  @Roles({ roles: ['realm:admin', 'realm:SUPER_ADMIN', 'realm:ADMIN'] })
  async getAllPayments() {
    return this.paymentsService.findAllAdmin();
  }

  @Get('users')
  @Roles({ roles: ['realm:admin', 'realm:SUPER_ADMIN', 'realm:ADMIN'] })
  async getAllUsers() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        tenant: {
          select: { id: true, name: true },
        },
      },
    });
  }

  @Patch('users/:userId/role')
  @Roles({ roles: ['realm:admin', 'realm:SUPER_ADMIN', 'realm:ADMIN'] })
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() body: { role: 'USER' | 'ADMIN' | 'MECHANIC' | 'SUPER_ADMIN' },
  ) {
    return this.authService.updateUserRole(userId, body.role);
  }
}
