import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Affirmations extends BaseSchema {
  protected tableName = 'affirmations'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('message')
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.text('message', 'longtext')
    })
  }
}
