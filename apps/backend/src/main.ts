import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './core/interceptors/timeout.interceptor';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Security: Set HTTP Headers
  app.use(helmet());
  app.use(cookieParser());

  // 2. Validation: Enforce clean DTOs & strict payloads
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip out properties not defined in DTO
      forbidNonWhitelisted: true, // throw errors if extra properties exist
      transform: true, // auto-transform payloads to DTO instances
    }),
  );

  // 3. Interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new TimeoutInterceptor(),
  );

  // 4. Exception Filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // 5. CORS: Allow frontend to communicate
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 SaaS Backend running on http://localhost:${port}`);
}

void bootstrap();
