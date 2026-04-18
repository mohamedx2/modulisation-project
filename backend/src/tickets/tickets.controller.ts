import { Controller, Get, Post, Body } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { KeycloakUser } from '../auth/interfaces/keycloak-user.interface';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  getTickets(@AuthenticatedUser() keycloakUser: KeycloakUser) {
    return this.ticketsService.findAll(keycloakUser.email);
  }

  @Post()
  createTicket(
    @AuthenticatedUser() keycloakUser: KeycloakUser,
    @Body() data: { title: string; description: string },
  ) {
    return this.ticketsService.create(keycloakUser.email, data);
  }
}
