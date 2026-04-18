import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userEmail: string, amount: number) {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user)
      throw new NotFoundException('User profile not synced to database.');

    return this.prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        status: 'COMPLETED', // Mocking a straight completion for prototype
      },
    });
  }

  async findAll(userEmail: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) return [];

    if (user.role === 'ADMIN') {
      return this.prisma.payment.findMany({ include: { user: true } });
    }

    return this.prisma.payment.findMany({
      where: { userId: user.id },
    });
  }
}
