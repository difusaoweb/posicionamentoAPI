import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Opinions extends BaseSchema {
  protected tableName = 'opinions'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('evaluation')

      table.integer('stronglyAgree', 1).nullable()
      table.integer('Agree', 1).nullable()
      table.integer('neutral', 1).nullable()
      table.integer('disagree', 1).nullable()
      table.integer('stronglyDisagree', 1).nullable()
    })
  }
}
