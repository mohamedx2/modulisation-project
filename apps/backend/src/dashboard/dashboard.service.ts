import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  getStats() {
    return [
      { name: 'Total Tickets', value: '12', iconType: 'Ticket', change: '+2.5%', changeType: 'positive' },
      { name: 'Pending Payments', value: ',400', iconType: 'CreditCard', change: '-4.1%', changeType: 'negative' },
      { name: 'Active Mechanics', value: '4', iconType: 'Users', change: '+0%', changeType: 'neutral' },
      { name: 'System Health', value: '98.9%', iconType: 'Activity', change: '+1.2%', changeType: 'positive' },
    ];
  }
}
