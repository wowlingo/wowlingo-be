import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: 'http://localhost:18090', // 프론트엔드 URL
    credentials: true,
  });

  // 글로벌 파이프 설정
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // API 경로 설정
  app.setGlobalPrefix('api');

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('[BE] 와우링고')
    .setDescription('와우링고 인터페이스 명세서')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
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
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI is available at: http://localhost:${port}/swagger-ui.html`);
}
bootstrap();