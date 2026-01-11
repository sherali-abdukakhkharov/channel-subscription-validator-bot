import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SentDocumentsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private get knex(): Knex {
    return this.databaseService.getKnex();
  }

  async create(data: { userId: number; pdfFileId: number }) {
    const [created] = await this.knex('sent_documents')
      .insert({
        user_id: data.userId,
        pdf_file_id: data.pdfFileId,
      })
      .returning('*');

    return created;
  }

  async wasDocumentSent(telegramId: number, pdfFileId: number): Promise<boolean> {
    const result = await this.knex('sent_documents')
      .join('users', 'sent_documents.user_id', 'users.id')
      .where({
        'users.telegram_id': telegramId,
        'sent_documents.pdf_file_id': pdfFileId,
      })
      .first();

    return !!result;
  }

  async getTotalSent() {
    return await this.knex('sent_documents').count('* as count').first();
  }

  async getUniqueRecipients() {
    return await this.knex('sent_documents').countDistinct('user_id as count').first();
  }
}
