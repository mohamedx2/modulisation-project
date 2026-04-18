import { Injectable, Logger } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(private readonly prisma: PrismaService) {}

  async saveOcrTask(userEmail: string, textFound: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await this.prisma.ocrTask.create({
        data: {
          textFound,
          userId: user.id,
          status: 'COMPLETED',
        },
      });
    }
  }

  async extractMatricule(
    imageBuffer: Buffer,
  ): Promise<{ matricule: string | null; raw: string }> {
    this.logger.log('Starting OCR extraction...');
    try {
      // Execute OCR

      const result = await Tesseract.recognize(imageBuffer, 'fra+ara', {
        logger: (m) => this.logger.verbose(m),
      });

      const rawText = result.data.text.trim();

      let matricule: string | null = null;

      // Match a French plate format: AB-123-CD
      const frenchMatch = new RegExp(/[A-Z]{2}[-\s]?\d{3}[-\s]?[A-Z]{2}/i).exec(
        rawText,
      );

      // Match a Tunisian plate format (e.g., 246 tun 1, or OCR garbage like 246 > 1)
      // Extracts the first set of digits and the second set of digits
      const tunisianMatch = new RegExp(
        /(\d{1,4})\s*(?:tun|TUN|تونس|>|à|\||tu|t)\s*(\d{1,4})/i,
      ).exec(rawText);

      if (tunisianMatch) {
        matricule = `${tunisianMatch[1]} TUN ${tunisianMatch[2]}`;
      } else if (frenchMatch) {
        matricule = frenchMatch[0].replace(/\s/g, '-').toUpperCase();
      }

      this.logger.log(`OCR complete. Extracted: ${matricule || rawText}`);

      return { matricule, raw: rawText };
    } catch (e) {
      this.logger.error('Failed to extract text from image', e);
      throw new Error('OCR extraction failed');
    }
  }
}
