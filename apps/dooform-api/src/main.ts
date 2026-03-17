import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDev = nodeEnv === 'development';

  const app = await NestFactory.create(AppModule, {
    logger: isDev
      ? ['log', 'error', 'warn', 'debug', 'verbose']
      : ['log', 'error', 'warn'],
  });

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      const corsOrigins = process.env.CORS_ORIGINS || '';
      const allowedOrigins = corsOrigins
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

      // Always allow dooform.com subdomains and localhost in dev
      if (
        allowedOrigins.includes(origin) ||
        /\.dooform\.com$/.test(origin) ||
        origin === 'https://dooform.com' ||
        origin === 'https://app.dooform.com' ||
        (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
      ) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: [
      'Origin',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'X-API-Key',
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 43200, // 12 hours
  });

  // Global prefix with health check exclusions
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'ready'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `Application is running on: http://localhost:${port}/api`,
  );
}

bootstrap();
