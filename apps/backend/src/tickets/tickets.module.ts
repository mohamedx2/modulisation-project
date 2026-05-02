import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [MailerModule],
  providers: [TicketsService, PrismaService],
  controllers: [TicketsController],
})
export class TicketsModule {}
