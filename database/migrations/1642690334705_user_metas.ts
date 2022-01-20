import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserMetas extends BaseSchema {
  protected tableName = 'usermeta'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.
        bigIncrements('meta_id').
        unsigned().
        notNullable()
      table.
        bigInteger('user_id').
        unsigned().
        notNullable().
        defaultTo(0).
        references('id').
        inTable('users').
        onDelete('CASCADE')
      table.string('meta_key').nullable()
      table.text('meta_value', 'longtext').nullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
