import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
  });
  app.enableShutdownHooks();
  await app.listen(3002);
  // console.log(app.getHttpAdapter().getInstance()._router.stack);
}
bootstrap();
