import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';

import { KeycloakUser } from '../core/security/keycloak-user.interface';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles({ roles: ['realm:user', 'realm:admin'] })
  create(
    @Body() createTicketDto: CreateTicketDto,
    @AuthenticatedUser() user: KeycloakUser,
  ) {
    return this.ticketsService.create(
      createTicketDto,
      user.sub,
      user.tenantId || 'default-tenant-id',
    );
  }

  @Get('summary/stats')
  @Roles({ roles: ['realm:user', 'realm:admin'] })
  getSummaryStats(@AuthenticatedUser() user: KeycloakUser) {
    return this.ticketsService.getTicketStats(user.tenantId || 'default-tenant-id');
  }

  @Get()
  @Roles({ roles: ['realm:user', 'realm:admin'] })
  findAll(@AuthenticatedUser() user: KeycloakUser) {
    return this.ticketsService.findAll(user.tenantId || 'default-tenant-id');
  }

  @Get(':id')
  @Roles({ roles: ['realm:user', 'realm:admin'] })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @Roles({ roles: ['realm:admin'] })
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @Roles({ roles: ['realm:admin'] })
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
