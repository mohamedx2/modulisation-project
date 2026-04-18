import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OcrModule } from './ocr/ocr.module';
import { OtpModule } from './otp/otp.module';

import {
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard,
} from 'nest-keycloak-connect';
import { MailerModule } from '@nestjs-modules/mailer';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { TicketsModule } from './tickets/tickets.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'renault_db',
      autoLoadEntities: true,
      synchronize: true, // DEV ONLY
    }),
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
      realm: process.env.KEYCLOAK_REALM || 'master',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'backend',
      secret: 'secret-if-required',
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST || 'smtp.example.com',
        port: 587,
        auth: {
          user: process.env.MAIL_USER || 'user',
          pass: process.env.MAIL_PASS || 'pass',
        },
      },
    }),
    OcrModule,
    OtpModule,
    AuthModule,
    TicketsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    PrismaService,
  ],
})
export class AppModule {}
