import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [MailerModule, PrismaModule],
  providers: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule {}
