import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private knex: Knex;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const config = this.configService.get('app.database');

    // Use connection string for cloud databases
    const connectionString =
      config.host !== 'localhost'
        ? `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.name}?sslmode=no-verify`
        : null;

    this.knex = knex({
      client: 'pg',
      connection: connectionString || {
        host: config.host,
        port: config.port,
        database: config.name,
        user: config.user,
        password: config.password,
      },
      migrations: {
        directory: './src/database/migrations',
        extension: 'ts',
      },
      pool: {
        min: 2,
        max: 10,
      },
    });

    // Run migrations
    await this.knex.migrate.latest();
    console.log('Database migrations completed');
  }

  async onModuleDestroy() {
    await this.knex.destroy();
  }

  getKnex(): Knex {
    return this.knex;
  }
}
