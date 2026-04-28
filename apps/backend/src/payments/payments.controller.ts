import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';

import { KeycloakUser } from '../core/security/keycloak-user.interface';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @AuthenticatedUser() user: KeycloakUser,
  ) {
    return this.paymentsService.create(
      createPaymentDto,
      user.sub,
      user.tenantId || 'default-tenant-id',
    );
  }

  @Get('export/csv')
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  async exportCsv(@AuthenticatedUser() user: KeycloakUser, @Res() res: Response) {
    const csv = await this.paymentsService.exportCsv(user.tenantId || 'default-tenant-id');
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="factures.csv"');
    res.send(csv);
  }

  @Get()
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  findAll(@AuthenticatedUser() user: KeycloakUser) {
    return this.paymentsService.findAll(user.tenantId || 'default-tenant-id');
  }

  @Get(':id')
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
