import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MongoExceptionFilter } from './filter/mongo-exception.filter';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { AllExceptionFilter } from './filter/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(
    new AllExceptionFilter(),
    new HttpExceptionFilter(),
    new MongoExceptionFilter(),
  );

  await app.listen(3000);
}
bootstrap();
