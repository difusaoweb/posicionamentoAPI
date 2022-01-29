import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Opinions extends BaseSchema {
  protected tableName = 'opinions'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('opinion_avaliation')
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.float('opinion_avaliation', 1, 1).notNullable().defaultTo(0)
    })
  }
}
