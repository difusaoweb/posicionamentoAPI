import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Opinions extends BaseSchema {
  protected tableName = 'opinions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('strongly_agree', 'agree', 'neutral', 'disagree', 'strongly_disagree')
      table.decimal('opinion_avaliation', 2, 2).notNullable().defaultTo(0)
    })
  }
}
