import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';

import { KeycloakUser } from '../core/security/keycloak-user.interface';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles({ roles: ['realm:user', 'realm:admin'] })
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

  @Get()
  @Roles({ roles: ['realm:user', 'realm:admin'] })
  findAll(@AuthenticatedUser() user: KeycloakUser) {
    return this.paymentsService.findAll(user.tenantId || 'default-tenant-id');
  }

  @Get(':id')
  @Roles({ roles: ['realm:user', 'realm:admin'] })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
