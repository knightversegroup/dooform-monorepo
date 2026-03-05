import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app/app.module';

const expressApp = express();
let cachedApp: Awaited<ReturnType<typeof NestFactory.create>> | null = null;

async function bootstrap() {
  if (!cachedApp) {
    cachedApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    cachedApp.setGlobalPrefix('api');
    await cachedApp.init();
  }
  return cachedApp;
}

export default async function handler(req: Request, res: Response) {
  await bootstrap();
  expressApp(req, res);
}
