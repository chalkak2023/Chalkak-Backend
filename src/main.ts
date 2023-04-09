import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { winstonLogger } from './common/logging/winston.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {logger: winstonLogger});
  app.enableCors({
    // origin: 'http://localhost:3000',
    origin: true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.use(cookieParser());
  await app.listen(8080);
}
bootstrap();
