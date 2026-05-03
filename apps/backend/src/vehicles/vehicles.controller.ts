import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';
import { VehiclesService } from './vehicles.service';
import { AuthenticatedUser, Roles, Unprotected } from 'nest-keycloak-connect';
import { KeycloakUser } from '../core/security/keycloak-user.interface';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  /**
   * Any authenticated user can list their tenant's vehicles.
   * @Roles is omitted — UniversalAuthGuard already ensures the user is logged in.
   */
  @Get()
  findAll(@AuthenticatedUser() user: KeycloakUser) {
    const tenantId = user?.tenantId || 'default-tenant-id';
    return this.vehiclesService.findAll(tenantId);
  }

  /**
   * Admin-only: get vehicles across ALL tenants.
   * Accepts any of the role aliases that admins may carry.
   */
  @Get('admin')
  @Roles({ roles: ['realm:admin', 'realm:ADMIN', 'realm:SUPER_ADMIN', 'ADMIN'] })
  findAllAdmin() {
    return this.vehiclesService.findAllAdmin();
  }

  /** Any authenticated user can add a vehicle to their account */
  @Post()
  create(
    @AuthenticatedUser() user: KeycloakUser,
    @Body() body: { name: string; plate: string; img?: string },
  ) {
    const tenantId = user?.tenantId || 'default-tenant-id';
    return this.vehiclesService.create(tenantId, body);
  }

  /** Admin-only: update vehicle details */
  @Patch(':id')
  @Roles({ roles: ['realm:admin', 'realm:ADMIN', 'realm:SUPER_ADMIN', 'ADMIN'] })
  update(
    @Param('id') id: string,
    @AuthenticatedUser() user: KeycloakUser,
    @Body() body: { name?: string; plate?: string; health?: number; lastService?: string },
  ) {
    const tenantId = user?.tenantId || 'default-tenant-id';
    return this.vehiclesService.update(id, tenantId, body);
  }

  /** Admin-only: soft-delete a vehicle */
  @Delete(':id')
  @Roles({ roles: ['realm:admin', 'realm:ADMIN', 'realm:SUPER_ADMIN', 'ADMIN'] })
  remove(
    @Param('id') id: string,
    @AuthenticatedUser() user: KeycloakUser,
  ) {
    const tenantId = user?.tenantId || 'default-tenant-id';
    return this.vehiclesService.remove(id, tenantId);
  }

  /** Any authenticated user can upload a vehicle image */
  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') id: string,
    @AuthenticatedUser() user: KeycloakUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new Error('Aucune image fournie');
    const tenantId = user?.tenantId || 'default-tenant-id';
    return this.vehiclesService.uploadImage(id, tenantId, file.buffer, file.mimetype);
  }

  /** Any authenticated user can fetch a vehicle image */
  @Get(':id/image')
  async getImage(
    @Param('id') id: string,
    @AuthenticatedUser() user: KeycloakUser,
    @Res() res: Response,
  ) {
    const tenantId = user?.tenantId || 'default-tenant-id';
    const vehicle = await this.vehiclesService.getImage(id, tenantId);
    const mimeType = vehicle.img?.startsWith('data:')
      ? vehicle.img.split(';')[0].split(':')[1]
      : 'image/jpeg';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(vehicle.imageData);
  }
}
