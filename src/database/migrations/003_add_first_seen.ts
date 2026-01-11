import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.schema.alterTable('users', (table) => {
    table.timestamp('first_seen_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('first_seen_at');
  });
}
