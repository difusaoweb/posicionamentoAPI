import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Opinions extends BaseSchema {
  protected tableName = 'opinions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('affirmation_parent')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.integer('affirmation_parent').
      unsigned().
      references('id').
      inTable('affirmations').
      onDelete('CASCADE')
    })
  }
}
