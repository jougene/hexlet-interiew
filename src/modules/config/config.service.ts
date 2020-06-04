import dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { ConnectionOptions, DatabaseType } from 'typeorm';

export interface MailParams {
  driver: string;
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
  requireTLS: boolean;
  fromMail: string;
}

export class ConfigService {
  constructor() {
    if (process.env.NODE_ENV !== 'production') {
      const env = process.env.NODE_ENV || 'development';
      const envFileName = env === 'production' ? undefined : `${env}.env`;
      if (!envFileName) {
        return;
      }
      const envFilePath = join(__dirname, '../../..', envFileName);
      dotenv.config({ path: envFilePath });
    }
  }

  get mailParams(): MailParams {
    return {
      driver: String(this.get('MAIL_DRIVER')) || 'smtp',
      host: this.get('MAIL_HOST'),
      port: Number(this.get('MAIL_PORT')),
      pass: this.get('MAIL_AUTH_PASSWORD'),
      user: this.get('MAIL_AUTH_USER'),
      secure: this.get('MAIL_SECURE') === 'true',
      requireTLS: this.get('MAIL_SECURE') === 'true',
      fromMail: this.get('MAIL_FROM'),
    };
  }

  get(key: string): string {
    if (!process.env[key] || process.env[key] === null) {
      throw new Error(`Unknown config key ${key}`);
    }

    return process.env[key]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  }

  get dbParams(): TypeOrmModuleOptions {
    const env = process.env.NODE_ENV || 'development';

    const commonOptions = {
      synchronize: false,
      entities: [`${__dirname}/../../**/*.entity{.ts,.js}`],
      migrationsRun: true,
      migrations: [`${__dirname}/../../db/migrations/**/*{.ts,.js}`],
      cli: {
        migrationsDir: 'src/db/migrations',
      },
      keepConnectionAlive: true,
      logging: process.env.DB_LOGGING === 'true',
    };

    const test = {
      type: process.env.DB_TYPE as DatabaseType,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ...commonOptions,
    } as ConnectionOptions;

    const development = {
      type: process.env.DB_TYPE as DatabaseType,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ...commonOptions,
    } as ConnectionOptions;

    const production: TypeOrmModuleOptions = {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      logging: true,
      ...commonOptions,
    };

    const configs: { [key: string]: TypeOrmModuleOptions } = { development, test, production };

    return configs[env];
  }
}
