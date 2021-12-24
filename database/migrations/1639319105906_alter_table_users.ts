import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterTableUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('obrigados').notNullable().defaultTo(0)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('obrigados')
    })
  }
}
