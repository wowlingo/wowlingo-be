import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:18090', 'http://localhost:3000', 
      "http://54.180.139.219:3000", "http://54.180.139.219:8080", "http://54.180.139.219:8090"], // 프론트엔드 URL들
    credentials: true,
  });

  // // '/sounds' 경로로 mp3 파일 서빙
  app.use('/sounds', express.static(join(__dirname, '..', 'sounds')));

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // API 경로 설정
  app.setGlobalPrefix('api');

  // Swagger 설정
  // [TODO] JWT 추가
  const config = new DocumentBuilder()
    .setTitle('[BE] 와우링고')
    .setDescription('와우링고 인터페이스 명세서')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger-ui.html', app, document, {
    swaggerOptions: {
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
      docExpansion: 'none',
    },
  });

  const port = process.env.PORT || 8080;
  await app.listen(port);

  console.log(`Node env on: ${process.env.NODE_ENV}`);
  console.log(`Database on: ${process.env.DB_HOST} : ${process.env.DB_PORT}`);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI is available at: http://localhost:${port}/swagger-ui.html`);
}
bootstrap();