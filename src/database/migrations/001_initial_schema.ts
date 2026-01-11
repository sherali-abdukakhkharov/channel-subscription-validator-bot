import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.bigInteger('telegram_id').unique().notNullable();
    table.string('first_name');
    table.string('last_name');
    table.string('username');
    table.string('utm_source').defaultTo('direct');
    table.timestamps(true, true);
  });

  // PDF files table
  await knex.schema.createTable('pdf_files', (table) => {
    table.increments('id').primary();
    table.string('filename').notNullable();
    table.string('file_path').notNullable();
    table.boolean('is_active').defaultTo(false);
    table.timestamps(true, true);
  });

  // Sent documents table
  await knex.schema.createTable('sent_documents', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('pdf_file_id').unsigned().references('id').inTable('pdf_files').onDelete('CASCADE');
    table.timestamp('sent_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('sent_documents');
  await knex.schema.dropTableIfExists('pdf_files');
  await knex.schema.dropTableIfExists('users');
}
