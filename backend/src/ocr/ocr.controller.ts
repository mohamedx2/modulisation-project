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
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { KeycloakUser } from '../auth/interfaces/keycloak-user.interface';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('matricule')
  @UseInterceptors(FileInterceptor('image'))
  async readMatricule(
    @UploadedFile() file: Express.Multer.File,
    @AuthenticatedUser() keycloakUser: KeycloakUser,
  ) {
    if (!file) {
      throw new HttpException('No image provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.ocrService.extractMatricule(file.buffer);
      if (keycloakUser && keycloakUser.email) {
        await this.ocrService.saveOcrTask(
          keycloakUser.email,
          result.matricule || 'none',
        );
      }
      return { success: true, matricule: result.matricule, raw: result.raw };
    } catch (e) {
      throw new HttpException(
        (e as Error).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
