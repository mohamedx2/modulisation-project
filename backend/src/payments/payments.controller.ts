import { Controller, Get, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { KeycloakUser } from '../auth/interfaces/keycloak-user.interface';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  getPayments(@AuthenticatedUser() keycloakUser: KeycloakUser) {
    return this.paymentsService.findAll(keycloakUser.email);
  }

  @Post()
  createPayment(
    @AuthenticatedUser() keycloakUser: KeycloakUser,
    @Body('amount') amount: number,
  ) {
    return this.paymentsService.create(keycloakUser.email, amount);
  }
}
