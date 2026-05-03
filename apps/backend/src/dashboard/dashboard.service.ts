import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(tenantId: string) {
    const [totalTickets, pendingPayments, activeMechanics] = await Promise.all([
      this.prisma.ticket.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.payment.aggregate({
        where: { tenantId, status: 'PENDING' },
        _sum: { amount: true },
      }),
      this.prisma.ticket.groupBy({
        by: ['createdBy'],
        where: { tenantId, deletedAt: null },
      }),
    ]);

    return [
      { name: 'Total Tickets', value: totalTickets.toString(), iconType: 'Ticket', change: '+0%', changeType: 'neutral' },
      { name: 'Pending Payments', value: `${pendingPayments._sum.amount || 0} EUR`, iconType: 'CreditCard', change: '0%', changeType: 'neutral' },
      { name: 'Active Mechanics', value: activeMechanics.length.toString(), iconType: 'Users', change: '+0%', changeType: 'neutral' },
      { name: 'System Health', value: '98.9%', iconType: 'Activity', change: '+1.2%', changeType: 'positive' },
    ];
  }

  async getVehicles(tenantId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { tenantId, deletedAt: null },
    });

    const defaultCarIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDQwQzEyIDM2LjY4NCAxNC42ODQgMzQgMTggMzRIMzJDMzUuMzE2IDM0IDM4IDM2LjY4NCAzOCA0MFY0MkgxMlY0MFoiIGZpbGw9IiM2QjcyODAiLz4KPHBhdGggZD0iTTIwIDMwTDI4IDI2TDMyIDMwVjM4SDIwVjMwWiIgZmlsbD0iIzZCNzI4MCIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjQwIiByPSI0IiBmaWxsPSIjMkQzMjM4Ii8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iNDAiIHI9IjQiIGZpbGw9IiMyRDMxMjgiLz4KPHBhdGggZD0iTTE2IDM4SDQyVjQySDE2VjM4WiIgZmlsbD0iIzJEMzIzOCIvPgo8L3N2Zz4K';

    return vehicles.map(vehicle => ({
      ...vehicle,
      img: vehicle.img || defaultCarIcon,
    }));
  }

  async createVehicle(tenantId: string, data: { name: string, plate: string, img?: string }) {
    return this.prisma.vehicle.create({
      data: {
        ...data,
        tenantId,
        health: 100,
        lastService: 'A l\'instant',
      },
    });
  }

  async getAdminStats() {
    const [totalUsers, totalTickets, totalVehicles, totalPayments, pendingPayments, totalTenants] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.ticket.count({ where: { deletedAt: null } }),
      this.prisma.vehicle.count({ where: { deletedAt: null } }),
      this.prisma.payment.count({ where: { deletedAt: null } }),
      this.prisma.payment.aggregate({
        where: { deletedAt: null, status: 'PENDING' },
        _sum: { amount: true },
      }),
      this.prisma.tenant.count({ where: { isActive: true } }),
    ]);

    const roleCounts = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
      where: { deletedAt: null },
    });

    return {
      totalUsers,
      totalTickets,
      totalVehicles,
      totalPayments,
      pendingAmount: pendingPayments._sum.amount || 0,
      totalTenants,
      roleCounts: roleCounts.reduce((acc, r) => {
        acc[r.role] = r._count.role;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }
}
