import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private get knex(): Knex {
    return this.databaseService.getKnex();
  }

  async findOrCreate(data: {
    telegramId: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    utmSource?: string;
  }) {
    const existing = await this.findByTelegramId(data.telegramId);

    if (existing) {
      return existing;
    }

    const [created] = await this.knex('users')
      .insert({
        telegram_id: data.telegramId,
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
        utm_source: data.utmSource || 'direct',
      })
      .returning('*');

    return created;
  }

  async findByTelegramId(telegramId: number) {
    return await this.knex('users').where({ telegram_id: telegramId }).first();
  }

  async getStatsByUtmSource() {
    return await this.knex('users').select('utm_source').count('* as count').groupBy('utm_source');
  }

  async getNewUsersCount(since: Date) {
    return await this.knex('users').where('created_at', '>=', since).count('* as count').first();
  }

  async getTotalCount() {
    return await this.knex('users').count('* as count').first();
  }

  async getInternalIdByTelegramId(telegramId: number): Promise<number | null> {
    const user = await this.findByTelegramId(telegramId);
    return user?.id || null;
  }
}
