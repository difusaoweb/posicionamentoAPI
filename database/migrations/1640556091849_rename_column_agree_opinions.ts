import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Opinions extends BaseSchema {
  protected tableName = 'opinions'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('Agree')
      table.integer('agree', 1).nullable()
    })
  }
}
