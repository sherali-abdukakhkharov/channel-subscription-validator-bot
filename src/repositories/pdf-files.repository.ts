import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PdfFilesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private get knex(): Knex {
    return this.databaseService.getKnex();
  }

  async findActive() {
    return await this.knex('pdf_files').where({ is_active: true }).first();
  }

  async create(data: {
    filename: string;
    filePath: string;
    telegramFileId?: string;
    isActive?: boolean;
  }) {
    const [created] = await this.knex('pdf_files')
      .insert({
        filename: data.filename,
        file_path: data.filePath,
        telegram_file_id: data.telegramFileId,
        is_active: data.isActive ?? false,
      })
      .returning('*');

    return created;
  }

  async deactivateAll() {
    await this.knex('pdf_files').update({ is_active: false });
  }

  async findById(id: number) {
    return await this.knex('pdf_files').where({ id }).first();
  }

  async delete(id: number) {
    await this.knex('pdf_files').where({ id }).delete();
  }
}
