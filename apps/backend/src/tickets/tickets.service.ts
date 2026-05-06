import { Injectable, NotFoundException, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async create(
    createTicketDto: CreateTicketDto,
    userId: string,
    tenantId: string,
    userEmail?: string,
  ) {
    let scheduledAtDate: Date | null = null;
    
    if (createTicketDto.scheduledAt) {
      const [datePart, timePart] = createTicketDto.scheduledAt.split('T');
      const [year, month, dayNum] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);

      // Parse as UTC to avoid server timezone shifts
      scheduledAtDate = new Date(Date.UTC(year, month - 1, dayNum, hours, minutes, 0));
      
      this.logger.log(`Validating RDV: ${createTicketDto.scheduledAt} -> UTC: ${scheduledAtDate.toISOString()}`);

      // 1. Check Working Days (use UTC day to match the input date)
      const dayOfWeek = scheduledAtDate.getUTCDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        throw new BadRequestException('Les rendez-vous ne sont pas disponibles le week-end (Samedi/Dimanche).');
      }

      // 2. Check Working Hours (9:00 - 17:00)
      if (hours < 9 || hours >= 17) {
        throw new BadRequestException(`Veuillez choisir une heure entre 09:00 et 17:00. (Reçu: ${hours}h)`);
      }

      // 3. Check for Conflicts (Overlap) - use a range to match the exact slot
      const slotEnd = new Date(scheduledAtDate.getTime() + 60 * 60 * 1000); // 1 hour slot
      const existing = await this.prisma.ticket.findFirst({
        where: {
          tenantId,
          scheduledAt: {
            gte: scheduledAtDate,
            lt: slotEnd,
          },
          deletedAt: null,
          status: { not: 'CLOSED' }
        }
      });

      if (existing) {
        throw new ConflictException('Ce créneau horaire est déjà réservé. Veuillez en choisir un autre.');
      }
    }

    // Ensure the tenant exists (auto-create on fresh databases)
    await this.prisma.tenant.upsert({
      where: { id: tenantId },
      update: {},
      create: { id: tenantId, name: 'Default Tenant' },
    });

    // Ensure the user exists locally (Keycloak users may not have a DB record yet)
    const userEmailVal = userEmail || `${userId}@reno.com`;
    let localUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!localUser) {
      // Try to find by email first - if found, we'll still use the Keycloak sub
      const existingByEmail = await this.prisma.user.findUnique({ where: { email: userEmailVal } });
      if (existingByEmail) {
        // Update the existing user to use the Keycloak sub as ID
        localUser = existingByEmail;
      } else {
        localUser = await this.prisma.user.create({
          data: {
            id: userId,
            email: userEmailVal,
            name: userEmail?.split('@')[0] || 'User',
            password: 'keycloak-managed',
            tenantId,
          },
        });
      }
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        title: createTicketDto.title,
        description: createTicketDto.description,
        status: 'OPEN',
        createdBy: localUser.id,
        tenantId: tenantId,
        scheduledAt: scheduledAtDate,
      },
    });

    // Send confirmation email
    if (userEmail) {
      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verifyUrl = `${frontendUrl}/verify-rdv/${ticket.id}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;
        
        await this.mailerService.sendMail({
          to: userEmail,
          subject: 'Confirmation de votre Rendez-vous Renault Axis',
          html: `
            <div style="font-family: sans-serif; padding: 40px; background-color: #f4f4f4;">
              <div style="background-color: #ffffff; padding: 40px; border-radius: 20px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #000; font-weight: 900; text-transform: uppercase; font-style: italic; font-size: 28px; margin: 0;">RENAULT <span style="color: #FFCC00;">AXIS</span></h1>
                  <p style="color: #666; font-size: 14px; font-weight: bold; margin-top: 5px;">Rendez-vous Confirmé</p>
                </div>
                
                <div style="border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 20px 0; margin-bottom: 30px;">
                  <p style="font-size: 16px; line-height: 1.6;">Bonjour,</p>
                  <p style="font-size: 16px; line-height: 1.6;">Votre rendez-vous pour <strong>${ticket.title}</strong> a bien été enregistré dans notre système.</p>
                </div>

                <div style="background: #FFFCEB; border: 1px solid #FFCC00; padding: 20px; border-radius: 15px; margin-bottom: 30px;">
                   <p style="margin: 0 0 10px 0; font-size: 12px; color: #856404; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Détails de l'intervention</p>
                   <p style="font-weight: bold; font-size: 18px; margin: 0; color: #333;">${ticket.description}</p>
                </div>

                <div style="text-align: center; background-color: #f9f9f9; padding: 30px; border-radius: 15px;">
                  <p style="font-size: 14px; font-weight: bold; color: #666; margin-bottom: 15px; text-transform: uppercase;">Présentez ce QR Code lors de votre arrivée</p>
                  <img src="${qrCodeUrl}" alt="QR Code RDV" style="border: 10px solid white; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
                  <p style="font-size: 12px; color: #999; margin-top: 15px;">ID Ticket: ${ticket.id}</p>
                </div>

                <div style="margin-top: 30px; text-align: center;">
                  <p style="font-size: 14px; color: #666;">Un conseiller Renault Axis vous contactera prochainement pour confirmer l'heure exacte.</p>
                  <p style="margin-top: 40px; font-size: 11px; color: #bbb; border-top: 1px solid #eee; padding-top: 20px;">Ceci est un message automatique, merci de ne pas y répondre. &copy; 2026 Renault Axis Digital Service.</p>
                </div>
              </div>
            </div>
          `,
        });
        this.logger.log(`Confirmation email sent to ${userEmail} for ticket ${ticket.id}`);
      } catch (e) {
        this.logger.error(`Failed to send confirmation email to ${userEmail}`, e.stack);
      }
    }

    return ticket;
  }

  async findAll(tenantId: string) {
    return this.prisma.ticket.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.ticket.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            tenantId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdminStats() {
    const [totalUsers, totalTickets, totalVehicles, totalPayments, pendingPayments] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.ticket.count({ where: { deletedAt: null } }),
      this.prisma.vehicle.count({ where: { deletedAt: null } }),
      this.prisma.payment.count({ where: { deletedAt: null } }),
      this.prisma.payment.aggregate({
        where: { deletedAt: null, status: 'PENDING' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalUsers,
      totalTickets,
      totalVehicles,
      totalPayments,
      pendingAmount: pendingPayments._sum.amount || 0,
    };
  }

  async findAllMine(userId: string, tenantId: string) {
    return this.prisma.ticket.findMany({
      where: {
        createdBy: userId,
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        scheduledAt: true,
        createdAt: true,
        updatedAt: true,
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

  async exportCsv(tenantId: string) {
    const tickets = await this.findAll(tenantId);
    let csv = 'ID,Titre,Status,Auteur ID,Date de création\n';
    tickets.forEach(ticket => {
      const date = ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('fr-FR') : 'N/A';
      csv += `${ticket.id},"${ticket.title}",${ticket.status},${ticket.createdBy},${date}\n`;
    });
    return csv;
  }

  async getReservedSlots(tenantId: string, startDate: Date, endDate: Date) {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        tenantId,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
        status: { not: 'CLOSED' },
      },
      select: {
        scheduledAt: true,
      },
    });
    return tickets.map(t => t.scheduledAt);
  }
}

