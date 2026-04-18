import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrController } from './ocr.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [OcrService, PrismaService],
  controllers: [OcrController],
  exports: [OcrService],
})
export class OcrModule {}
