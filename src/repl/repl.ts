import { INestApplication } from '@nestjs/common';
import { NestFactory, DiscoveryService, ModuleRef } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import path from 'path';
import repl from 'repl';
import { AppModule } from '../modules/app/app.module';
import { bootstrapApp } from '../bootstrap';
import { Context } from 'vm';
import { Connection } from 'typeorm';
import { flatten } from '@nestjs/common';
import _ from 'lodash';

const bootstrap = async (): Promise<NestExpressApplication> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  bootstrapApp(app);

  await app.init();

  return app;
};

const setUpEntites = (app: INestApplication, context: Context): void => {
  const connection = app.get(Connection);
  const entitiesList = connection.entityMetadatas;
  entitiesList.forEach(e => {
    context[e.name] = e.target;
  });
};

const setUpInjectables = (app: INestApplication, context: Context): void => {
  const weakApp = app as any;
  const modules = [...weakApp.container.modules.values()];
  const providers = flatten(modules.map(item => [...item.providers.values()]));

  const serviceNames = _.uniq(providers.map(p => p.name).filter(p => typeof p === 'string'));

  serviceNames.forEach(token => {
    const lowerCased = token.charAt(0).toLowerCase() + token.slice(1);
    context[lowerCased] = app.get(token);
  });
};

bootstrap().then(async app => {
  const replServer = repl.start({ prompt: 'app#> ', useGlobal: true });
  replServer.setupHistory(path.join(process.env.PWD!, './.node_history'), e => {
    if (e) {
      console.log(e);
      process.exit(1);
    }
  });
  replServer.context.app = app;
  setUpEntites(app, replServer.context);
  setUpInjectables(app, replServer.context);
});
