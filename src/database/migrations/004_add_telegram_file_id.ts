import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.schema.alterTable('pdf_files', (table) => {
    table.text('telegram_file_id');
  });
}

export async function down(knex: Knex) {
  await knex.schema.alterTable('pdf_files', (table) => {
    table.dropColumn('telegram_file_id');
  });
}
