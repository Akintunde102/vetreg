import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: configService.get<string>('frontend.url'),
    credentials: true,
  });

  // API prefix
  const apiVersion = configService.get<string>('apiVersion');
  app.setGlobalPrefix(`api/${apiVersion}`);

  // OpenAPI document for Scalar API docs
  const openApiConfig = new DocumentBuilder()
    .setTitle('Vet Reg API')
    .setDescription('Veterinary registration and treatment tracking API (v1.1)')
    .setVersion(apiVersion ?? 'v1')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addTag('Health', 'Health and root')
    .addTag('Auth', 'Authentication')
    .addTag('Vets', 'Veterinarians')
    .addTag('Organizations', 'Organizations and approvals')
    .addTag('Clients', 'Clients')
    .addTag('Animals', 'Animals and treatment history')
    .addTag('Treatments', 'Treatments, scheduling, and payments')
    .addTag('Memberships', 'Organization memberships')
    .build();
  const document = SwaggerModule.createDocument(app, openApiConfig);
  app.use(
    '/docs',
    apiReference({
      content: document,
      theme: 'default',
      metaData: {
        title: 'Vet Reg API Reference',
      },
    }),
  );

  const port = configService.get<number>('port', 3001);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API available at: http://localhost:${port}/api/${apiVersion}`);
  console.log(`📖 API docs (Scalar) at: http://localhost:${port}/docs`);
}
bootstrap();
