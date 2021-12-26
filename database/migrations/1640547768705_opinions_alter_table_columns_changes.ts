import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Opinions extends BaseSchema {
  protected tableName = 'opinions'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('evaluation')
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('evaluation', 4).notNullable().defaultTo(0)
    })
  }
}
