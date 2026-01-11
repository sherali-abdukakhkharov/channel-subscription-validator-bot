import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add indexes for users table
  await knex.schema.alterTable('users', (table) => {
    table.index('telegram_id');
    table.index('utm_source');
    table.index(['utm_source', 'created_at']);
  });

  // Add indexes for pdf_files table
  await knex.schema.alterTable('pdf_files', (table) => {
    table.index('is_active');
  });

  // Add indexes for sent_documents table
  await knex.schema.alterTable('sent_documents', (table) => {
    table.index('user_id');
    table.index('pdf_file_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sent_documents', (table) => {
    table.dropIndex(['user_id', 'pdf_file_id']);
  });

  await knex.schema.alterTable('pdf_files', (table) => {
    table.dropIndex('is_active');
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropIndex(['utm_source', 'created_at']);
    table.dropIndex('utm_source');
    table.dropIndex('telegram_id');
  });
}
