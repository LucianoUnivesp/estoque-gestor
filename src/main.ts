import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as methodOverride from 'method-override';
import { NotFoundFilter } from './filters/not-found.filter';

const chalk = require('chalk');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setViewEngine('ejs');

  app.use(methodOverride('_method'));
  app.useGlobalFilters(new NotFoundFilter());

  const config = new DocumentBuilder()
    .setTitle('Estoque Gestor API')
    .setDescription('API para gerenciar estoque')
    .setVersion('1.0')
    .addTag('Stock')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3013);

  const logger = new Logger(AppModule.name);

  const httpAdapter = app.getHttpAdapter();
  const server = httpAdapter.getInstance();
  const routes = server._router.stack
    .filter((r: any) => r.route)
    .map((r: any) => ({
      method: Object.keys(r.route.methods)[0].toUpperCase(),
      path: r.route.path,
    }));

  const methodColors: Record<string, (text: string) => string> = {
    GET: chalk.blue,
    POST: chalk.green,
    PUT: chalk.yellow,
    PATCH: chalk.magenta,
    DELETE: chalk.red,
  };

  Logger.log(chalk.cyan('Lista de endpoints disponíveis:'));
  routes.forEach((route) => {
    const color = methodColors[route.method] || chalk.white;
    const coloredMethod = color(route.method);
    const coloredPath = chalk.yellow(route.path);
    Logger.log(`${coloredMethod} ${coloredPath}`);
  });

  logger.log(chalk.cyan(`Application is running on: ${await app.getUrl()}`));
  logger.log(chalk.magenta(`Swagger is available at: ${await app.getUrl()}/api-docs`));
}

bootstrap();
