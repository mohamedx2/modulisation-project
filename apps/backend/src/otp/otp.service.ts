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
        subject: 'Votre Code de Vérification Renault',
        // For production, use templates. We just send raw OTP here.
        text: `Votre code de vérification est : ${code}. Il expire dans 5 minutes.`,
        html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #FFCC00;">Vérification Renault Axis</h2>
                <p>Votre code de vérification pour votre réservation est :</p>
                <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">
                  ${code}
                </div>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">Ce code expire dans 5 minutes.</p>
               </div>`,
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
