import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OcrModule } from './ocr/ocr.module';
import { OtpModule } from './otp/otp.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

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
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'renault_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
      realm: process.env.KEYCLOAK_REALM || 'master',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'backend',
      secret: 'secret-if-required',
      useNestLogger: true,
      verifyTokenAudience: false,
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
    CacheModule.register({
      isGlobal: true,

      store: redisStore as unknown as string,
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      ttl: 60,
    }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    OcrModule,
    OtpModule,
    AuthModule,
    TicketsModule,
    PaymentsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ResourceGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
    PrismaService,
  ],
})
export class AppModule {}
