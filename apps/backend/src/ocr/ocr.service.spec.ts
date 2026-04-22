import { Test, TestingModule } from '@nestjs/testing';
import { OcrService } from './ocr.service';
import * as Tesseract from 'tesseract.js';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('tesseract.js', () => ({
  recognize: jest.fn(),
}));

describe('OcrService', () => {
  let service: OcrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OcrService,
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn() },
            ocrTask: { create: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<OcrService>(OcrService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractMatricule', () => {
    it('should successfully extract a formatted matricule (AB-123-CD)', async () => {
      // Mock Tesseract response
      const mockResult = {
        data: {
          text: 'Some random text before plate AB 123 CD and some text after',
        },
      };
      (Tesseract.recognize as jest.Mock).mockResolvedValue(mockResult);

      const buffer = Buffer.from('fake-image-data');
      const result = await service.extractMatricule(buffer);

      expect(Tesseract.recognize).toHaveBeenCalledWith(
        buffer,
        'fra+ara',
        expect.any(Object),
      );
      expect(result.matricule).toBe('AB-123-CD');
      expect(result.raw).toBe(
        'Some random text before plate AB 123 CD and some text after',
      );
    });

    it('should successfully extract a Tunisian matricule from raw OCR text', async () => {
      // Mock Tesseract response
      const mockResult = {
        data: {
          text: '[ 246 > 1 | 246 à 1]',
        },
      };
      (Tesseract.recognize as jest.Mock).mockResolvedValue(mockResult);

      const buffer = Buffer.from('fake-tunisian-image-data');
      const result = await service.extractMatricule(buffer);

      expect(result.matricule).toBe('246 TUN 1');
    });

    it('should return null for matricule if no valid plate format is found', async () => {
      const mockResult = {
        data: {
          text: 'No plate here, just some text 123 456',
        },
      };
      (Tesseract.recognize as jest.Mock).mockResolvedValue(mockResult);

      const buffer = Buffer.from('fake-image-data-2');
      const result = await service.extractMatricule(buffer);

      expect(result.matricule).toBeNull();
      expect(result.raw).toBe('No plate here, just some text 123 456');
    });

    it('should throw an error if Tesseract throws an error', async () => {
      (Tesseract.recognize as jest.Mock).mockRejectedValue(
        new Error('Tesseract failed'),
      );

      const buffer = Buffer.from('error-image');
      await expect(service.extractMatricule(buffer)).rejects.toThrow(
        'OCR extraction failed',
      );
    });
  });
});
