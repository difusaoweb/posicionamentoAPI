import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Opinions extends BaseSchema {
  protected tableName = 'opinions'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('stronglyAgree')
      table.dropColumn('stronglyDisagree')

      table.integer('strongly_agree', 1).nullable()
      table.integer('strongly_disagree', 1).nullable()
    })
  }
}
