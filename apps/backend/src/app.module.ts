import { Module } from '@nestjs/common';
import * as path from 'path';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
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
  TokenValidation,
} from 'nest-keycloak-connect';
import { MailerModule } from '@nestjs-modules/mailer';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TicketsModule } from './tickets/tickets.module';
import { PaymentsModule } from './payments/payments.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DashboardModule } from './dashboard/dashboard.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { AdminModule } from './admin/admin.module';

import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { WinstonInMemoryTransport } from './core/logging/in-memory.logger';

import { MetricsController } from './core/metrics/metrics.controller';
import { LogsController } from './core/logs/logs.controller';
import { UniversalAuthGuard } from './core/security/universal-auth.guard';
import { UniversalRoleGuard } from './core/security/universal-role.guard';
import { UniversalResourceGuard } from './core/security/universal-resource.guard';
import { HttpMetricsInterceptor } from './core/metrics/http-metrics.interceptor';
import { WinstonExceptionFilter } from './core/filters/winston-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'backend.log',
          dirname: path.join(process.cwd(), 'logs'),
          maxsize: 5242880,
          maxFiles: 5,
        }),
        new WinstonInMemoryTransport(),
      ],
    }),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'nestjs_',
        },
      },
      path: '/metrics',
      controller: MetricsController,
    }),
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
      authServerUrl: process.env.KEYCLOAK_URL || 'http://keycloak:8080',
      realm: process.env.KEYCLOAK_REALM || 'reno',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'backend',
      secret:
        process.env.KEYCLOAK_CLIENT_SECRET ||
        'lgLCI4KGNki1p8ULBt7l5A4zCE0kTIb6',
      useNestLogger: true,
      verifyTokenAudience: false,
      cookieKey: 'access_token',
      tokenValidation: TokenValidation.OFFLINE,
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
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
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 1000 }]),
    OcrModule,
    OtpModule,
    AuthModule,
    TicketsModule,
    PaymentsModule,
    DashboardModule,
    VehiclesModule,
    AdminModule,
    PrismaModule,
  ],
  controllers: [AppController, MetricsController, LogsController],
  providers: [
    AppService,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: UniversalAuthGuard },
    { provide: APP_GUARD, useClass: UniversalResourceGuard },
    { provide: APP_GUARD, useClass: UniversalRoleGuard },
    { provide: APP_INTERCEPTOR, useClass: HttpMetricsInterceptor },
    { provide: APP_FILTER, useClass: WinstonExceptionFilter },
  ],
})
export class AppModule { }
