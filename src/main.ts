import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggerInterceptor } from './location';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app
    .useGlobalPipes(new ValidationPipe({ transform: true }))
    .useGlobalInterceptors(new LoggerInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
