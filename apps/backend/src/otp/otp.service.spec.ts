import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('OtpService', () => {
  let service: OtpService;
  let mailerService: MailerService;

  beforeEach(async () => {
    // Creating Mock MailerService
    const mockMailerService = {
      sendMail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCode', () => {
    it('should return a 6-digit string', () => {
      const code = service.generateCode();
      expect(code.length).toBe(6);
      expect(Number(code)).not.toBeNaN();
    });
  });

  describe('sendOtp and verifyOtp lifecycle', () => {
    it('should successfully send an OTP to email', async () => {
      const email = 'test@example.com';
      const result = await service.sendOtp(email);
      expect(result).toBe(true);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mailerService.sendMail).toHaveBeenCalled();
    });

    it('should correctly verify an existing OTP, and invalidate it after', async () => {
      const email = 'test@example.com';
      await service.sendOtp(email);

      // Access the internal mapped 'otpStore' via reflective bypass or spy generateCode.
      // Better approach: mock generateCode.
      jest.spyOn(service, 'generateCode').mockReturnValue('123456');
      await service.sendOtp(email); // Replace it again for predictability

      // First verification should pass
      const isVerified = service.verifyOtp(email, '123456');
      expect(isVerified).toBe(true);

      // Second verification should fail (deleted upon verification)
      const isVerifiedTwice = service.verifyOtp(email, '123456');
      expect(isVerifiedTwice).toBe(false);
    });

    it('should reject invalid OTP', async () => {
      const email = 'test@example.com';
      jest.spyOn(service, 'generateCode').mockReturnValue('123456');
      await service.sendOtp(email);

      const isVerified = service.verifyOtp(email, '999999'); // Wrong code
      expect(isVerified).toBe(false);
    });
  });
});
