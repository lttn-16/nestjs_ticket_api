import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { MyLogger } from './logger/my.logger';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(new MyLogger());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors();
  app.useStaticAssets(join(__dirname, '../uploads'), { prefix: '/uploads' });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
