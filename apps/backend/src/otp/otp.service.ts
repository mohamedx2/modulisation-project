import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly otpStore = new Map<
    string,
    { code: string; expiresAt: number }
  >();

  constructor(private readonly mailerService: MailerService) {}

  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email: string): Promise<boolean> {
    const code = this.generateCode();
    // Expires in 5 minutes
    this.otpStore.set(email, { code, expiresAt: Date.now() + 5 * 60 * 1000 });

    const mailHost = process.env.MAIL_HOST || 'smtp.example.com';
    if (mailHost === 'smtp.example.com') {
      this.logger.warn(`[DUMMY MODE] Simulated sending OTP to ${email}. The code is: ${code}`);
      return true;
    }

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your Password Reset OTP',
        // For production, use templates. We just send raw OTP here.
        text: `Your reset code is: ${code}. It expires in 5 minutes.`,
        html: `<h2>Password Reset</h2><p>Your OTP code is <b style="color:red; font-size:24px;">${code}</b></p>`,
      });
      this.logger.log(`Sent OTP to ${email}`);
      return true;
    } catch (e) {
      this.logger.error('Failed to send email OTP', e);
      return false;
    }
  }

  verifyOtp(email: string, code: string): boolean {
    const entry = this.otpStore.get(email);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.otpStore.delete(email);
      return false; // Expired
    }

    if (entry.code === code) {
      this.otpStore.delete(email); // Invalidate once used
      return true;
    }

    return false;
  }
}
