import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Opinions extends BaseSchema {
  protected tableName = 'opinions'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.renameColumn('opinion_avaliation', 'opinion_value')
    })
  }
}
