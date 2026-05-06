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

  @Get('activity')
  @Roles({ roles: ['realm:admin', 'realm:SUPER_ADMIN', 'realm:ADMIN'] })
  async getActivity() {
    const [tickets, vehicles, payments, users] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          creator: { select: { name: true, email: true } },
        },
      }),
      this.prisma.vehicle.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: {
          tenant: { select: { name: true } },
        },
      }),
      this.prisma.payment.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      this.prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const activities: {
      id: string;
      type: string;
      method: string;
      path: string;
      status: string;
      statusCode: number;
      timestamp: Date;
      user: string;
      details: string;
    }[] = [];

    for (const ticket of tickets) {
      activities.push({
        id: ticket.id,
        type: 'ticket',
        method: 'POST',
        path: '/tickets',
        status: ticket.status || 'OPEN',
        statusCode: 201,
        timestamp: ticket.createdAt,
        user: (ticket as any).creator?.name || 'System',
        details: ticket.title || 'New ticket',
      });
    }

    for (const vehicle of vehicles) {
      activities.push({
        id: vehicle.id,
        type: 'vehicle',
        method: 'POST',
        path: '/vehicles',
        status: 'ACTIVE',
        statusCode: 201,
        timestamp: vehicle.createdAt,
        user: (vehicle as any).tenant?.name || 'Fleet',
        details: vehicle.name || vehicle.plate || 'New vehicle',
      });
    }

    for (const payment of payments) {
      activities.push({
        id: payment.id,
        type: 'payment',
        method: 'POST',
        path: '/payments',
        status: payment.status || 'PENDING',
        statusCode: 200,
        timestamp: payment.createdAt,
        user: (payment as any).user?.name || 'User',
        details: `${payment.amount}€ - ${payment.status}`,
      });
    }

    for (const user of users) {
      activities.push({
        id: user.id,
        type: 'user',
        method: 'POST',
        path: '/auth/signup',
        status: 'REGISTERED',
        statusCode: 201,
        timestamp: user.createdAt,
        user: user.name || user.email,
        details: user.role,
      });
    }

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return activities.slice(0, 30);
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
