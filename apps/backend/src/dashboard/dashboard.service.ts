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
      { name: 'Pending Payments', value: `${pendingPayments._sum.amount || 0} €`, iconType: 'CreditCard', change: '0%', changeType: 'neutral' },
      { name: 'Active Mechanics', value: activeMechanics.length.toString(), iconType: 'Users', change: '+0%', changeType: 'neutral' },
      { name: 'System Health', value: '98.9%', iconType: 'Activity', change: '+1.2%', changeType: 'positive' },
    ];
  }
}
