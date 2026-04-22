import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import 'multer';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';

import { KeycloakUser } from '../core/security/keycloak-user.interface';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('matricule')
  @Roles({ roles: ['realm:user', 'realm:admin', 'realm:mechanic'] })
  @UseInterceptors(FileInterceptor('image'))
  async readMatricule(
    @UploadedFile() file: Express.Multer.File,
    @AuthenticatedUser() user: KeycloakUser,
  ) {
    if (!file) {
      throw new HttpException('No image provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.ocrService.extractMatricule(file.buffer);

      const userId = user.sub;
      const tenantId = user.tenantId || 'default-tenant-id';

      await this.ocrService.saveOcrTask(
        userId,
        tenantId,
        result.raw,
        result.matricule,
      );

      return { success: true, matricule: result.matricule, raw: result.raw };
    } catch (e) {
      throw new HttpException(
        (e as Error).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
