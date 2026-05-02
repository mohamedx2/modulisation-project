import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';
import { VehiclesService } from './vehicles.service';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { KeycloakUser } from '../core/security/keycloak-user.interface';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  findAll(@AuthenticatedUser() user: KeycloakUser) {
    return this.vehiclesService.findAll(user.tenantId || 'default-tenant-id');
  }

  @Post()
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  create(
    @AuthenticatedUser() user: KeycloakUser,
    @Body() body: { name: string; plate: string; img?: string },
  ) {
    return this.vehiclesService.create(
      user.tenantId || 'default-tenant-id',
      body,
    );
  }

  @Post(':id/image')
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') id: string,
    @AuthenticatedUser() user: KeycloakUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new Error('Aucune image fournie');
    return this.vehiclesService.uploadImage(
      id,
      user.tenantId || 'default-tenant-id',
      file.buffer,
      file.mimetype,
    );
  }

  @Get(':id/image')
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:default-roles-reno'] })
  async getImage(
    @Param('id') id: string,
    @AuthenticatedUser() user: KeycloakUser,
    @Res() res: Response,
  ) {
    const vehicle = await this.vehiclesService.getImage(
      id,
      user.tenantId || 'default-tenant-id',
    );
    const mimeType = vehicle.img?.startsWith('data:')
      ? vehicle.img.split(';')[0].split(':')[1]
      : 'image/jpeg';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(vehicle.imageData);
  }
}
