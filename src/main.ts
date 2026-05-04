import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Serve Flutter web app as static files from /app
  app.useStaticAssets(path.join(process.cwd(), 'public', 'app'), {
    prefix: '/app',
  });

  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: '/', method: 0 },
      { path: 'tiktokq4zO2CARHHYwqXYe65LyytYI4HjhO5I7.txt', method: 0 },
      { path: 'terms', method: 0 },
      { path: 'privacy', method: 0 },
      { path: 'app', method: 0 },
      { path: 'app/(.*)', method: 0 },
    ],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 SurgeUp API running on port ${port}`);
}

bootstrap();