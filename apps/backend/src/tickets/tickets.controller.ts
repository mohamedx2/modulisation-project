import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
} from '@nestjs/common';
import express from 'express';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';

import { KeycloakUser } from '../core/security/keycloak-user.interface';
import { Public } from 'nest-keycloak-connect';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('verify/:id')
  @Public()
  verifyTicket(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  create(
    @Body() createTicketDto: CreateTicketDto,
    @AuthenticatedUser() user: KeycloakUser,
  ) {
    return this.ticketsService.create(
      createTicketDto,
      user.sub,
      user.tenantId || 'default-tenant-id',
      createTicketDto.email || user.email
    );
  }

  @Get('summary/stats')
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  getSummaryStats(@AuthenticatedUser() user: KeycloakUser) {
    return this.ticketsService.getTicketStats(user.tenantId || 'default-tenant-id');
  }

  @Get('export/csv')
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  async exportCsv(@AuthenticatedUser() user: KeycloakUser, @Res() res: express.Response) {
    const csv = await this.ticketsService.exportCsv(user.tenantId || 'default-tenant-id');
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="tickets.csv"');
    res.send(csv);
  }

  @Get()
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  findAll(@AuthenticatedUser() user: KeycloakUser) {
    return this.ticketsService.findAll(user.tenantId || 'default-tenant-id');
  }

  @Get('reserved-slots')
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  getReservedSlots(
    @AuthenticatedUser() user: KeycloakUser,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.ticketsService.getReservedSlots(
      user.tenantId || 'default-tenant-id',
      new Date(start),
      new Date(end),
    );
  }

  @Get('mine')
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  findAllMine(@AuthenticatedUser() user: KeycloakUser) {
    return this.ticketsService.findAllMine(
      user.sub,
      user.tenantId || 'default-tenant-id',
    );
  }

  @Get(':id')
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
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
