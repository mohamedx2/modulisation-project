import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';
import { Unprotected } from 'nest-keycloak-connect';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  @Unprotected()
  async sendOtp(@Body('email') email: string) {
    const success = await this.otpService.sendOtp(email);
    return { success };
  }

  @Post('verify')
  @Unprotected()
  verifyOtp(@Body('email') email: string, @Body('code') code: string) {
    const valid = this.otpService.verifyOtp(email, code);
    return { valid };
  }
}
