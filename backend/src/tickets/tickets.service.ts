import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userEmail: string,
    data: { title: string; description: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user)
      throw new NotFoundException('User profile not synced to database.');

    return this.prisma.ticket.create({
      data: {
        ...data,
        userId: user.id,
      },
    });
  }

  async findAll(userEmail: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) return [];

    // Admins usually see everything, but for now we filter by user:
    // If the user has 'ADMIN' role we could branch here.
    if (user.role === 'ADMIN') {
      return this.prisma.ticket.findMany({ include: { user: true } });
    }

    return this.prisma.ticket.findMany({
      where: { userId: user.id },
    });
  }
}
