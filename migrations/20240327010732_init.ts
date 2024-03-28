import type { Knex } from 'knex';

export function up(knex: Knex) {
  return knex.schema
    .createTable('article', table => {
      table.string('id', 13).comment("article's timestamp and last 3 chars");
      table.string('title', 50).notNullable();
      table.string('author', 20).notNullable();
      table.text('content');
      table.string('board', 10).notNullable();
      table.timestamp('created_at', { precision: 3 }).defaultTo(knex.fn.now());
      table.primary(['id']);
    })
    .createTable('task', table => {
      table.string('board', 10).notNullable();
      table.string('keyword', 20).notNullable().comment('searching keyword');
      table.boolean('get_content').notNullable().comment('fetch article body or not');
      table.smallint('page').notNullable().comment('fetch how many pages');
      table.boolean('active').notNullable();
      table.timestamp('updated_at', { precision: 3 }).defaultTo(knex.fn.now());
      table.primary(['board', 'keyword']);
    })
    .createTable('execute_log', table => {
      table.string('board', 10).notNullable();
      table.string('keyword', 20).notNullable().comment('searching keyword');
      table.smallint('article_count').notNullable();
      table.string('last_article', 13).comment("last fetched article's id");
      table.timestamp('created_at', { precision: 3 }).defaultTo(knex.fn.now());
      table.primary(['board', 'keyword', 'created_at']);
      table.foreign(['board', 'keyword']).references(['board', 'keyword']).inTable('task');
    })
    ;
}

export function down(knex: Knex) {
  return knex.schema
    .dropTable('execute_log')
    .dropTable('task')
    .dropTable('article')
    ;
}
