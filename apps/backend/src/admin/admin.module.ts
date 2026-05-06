import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { TicketsModule } from '../tickets/tickets.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { PaymentsModule } from '../payments/payments.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TicketsModule, VehiclesModule, PaymentsModule, PrismaModule, AuthModule],
  controllers: [AdminController],
})
export class AdminModule {}
