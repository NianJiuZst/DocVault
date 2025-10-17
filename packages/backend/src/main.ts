import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); 
  const configService = app.get(ConfigService);
  const port = configService.get('port');
  app.enableCors({
    origin: 'http://localhost:3000', 
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], 
    exposedHeaders: ['Set-Cookie'], 
  });
  await app.listen(port);
  console.log(`服务运行在 http://localhost:${port}`);
}
bootstrap();
