import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    userId: string,
    tenantId: string,
  ) {
    return this.prisma.payment.create({
      data: {
        amount: createPaymentDto.amount,
        status: 'PENDING',
        userId: userId,
        tenantId: tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.payment.findMany({
      include: { user: true },
      where: {
        tenantId,
        deletedAt: null,
      },
    });
  }

  async exportCsv(tenantId: string) {
    const payments = await this.findAll(tenantId);
    
    // Define CSV Headers
    let csv = 'ID,Montant,Status,Email Utilisateur,Date de création\n';
    
    // Add rows
    payments.forEach(payment => {
      const email = payment.user?.email || 'N/A';
      const date = payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('fr-FR') : 'N/A';
      csv += `${payment.id},${payment.amount},${payment.status},${email},${date}\n`;
    });
    
    return csv;
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, deletedAt: null },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}
