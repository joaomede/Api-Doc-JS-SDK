import * as Knex from 'knex'

export async function up (knex: Knex): Promise<void> {
  return knex.schema.createTable('tags', table => {
    table.increments()
    table.text('nameTag').notNullable()
    table.text('descriptionTag').notNullable()
    table.timestamps(true, true)
    table.integer('apiIdFk').unsigned().references('id').inTable('api').onDelete('CASCADE').index()
    table.integer('userIdFk').unsigned().references('id').inTable('users').onDelete('CASCADE').index()
  })
}

export async function down (knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('tags')
}
