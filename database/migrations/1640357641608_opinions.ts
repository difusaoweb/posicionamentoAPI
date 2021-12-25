import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Opinions extends BaseSchema {
  protected tableName = 'opinions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('opinion_author').
        unsigned().
        references('id').
        inTable('users').
        onDelete('CASCADE').
        notNullable()
      table.integer('evaluation', 1).notNullable().defaultTo(0)
      table.integer('affirmation_parent').
        unsigned().
        references('id').
        inTable('affirmations').
        onDelete('CASCADE').
        nullable()
      table.integer('opinion_parent').
        unsigned().
        references('id').
        inTable('opinions').
        onDelete('CASCADE').
        nullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
