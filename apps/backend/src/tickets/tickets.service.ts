import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createTicketDto: CreateTicketDto,
    userId: string,
    tenantId: string,
  ) {
    return this.prisma.ticket.create({
      data: {
        title: createTicketDto.title,
        description: createTicketDto.description,
        status: 'OPEN',
        createdBy: userId,
        tenantId: tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.ticket.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTicketStats(tenantId: string) {
    const total = await this.prisma.ticket.count({ where: { tenantId, deletedAt: null }});
    const enCours = await this.prisma.ticket.count({ where: { tenantId, deletedAt: null, status: 'OPEN' }});
    const enAttente = await this.prisma.ticket.count({ where: { tenantId, deletedAt: null, status: 'PENDING' }});
    const clotures = await this.prisma.ticket.count({ where: { tenantId, deletedAt: null, status: 'CLOSED' }});

    if (total === 0) {
      return [
        { label: 'Total', value: '0', icon: 'AlertCircle', color: 'text-gray-900' },
        { label: 'En cours', value: '0', icon: 'Clock', color: 'text-blue-600' },
        { label: 'En attente', value: '0', icon: 'Clock', color: 'text-amber-600' },
        { label: 'Clôturés', value: '0', icon: 'CheckCircle2', color: 'text-emerald-600' },
      ];
    }

    return [
      { label: 'Total', value: total.toString(), icon: 'AlertCircle', color: 'text-gray-900' },
      { label: 'En cours', value: enCours.toString(), icon: 'Clock', color: 'text-blue-600' },
      { label: 'En attente', value: enAttente.toString(), icon: 'Clock', color: 'text-amber-600' },
      { label: 'Clôturés', value: clotures.toString(), icon: 'CheckCircle2', color: 'text-emerald-600' },
    ];
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, deletedAt: null },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    await this.findOne(id);
    return this.prisma.ticket.update({
      where: { id },
      data: updateTicketDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.ticket.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
