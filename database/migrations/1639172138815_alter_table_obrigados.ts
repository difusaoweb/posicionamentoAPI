import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterTableObrigados extends BaseSchema {
  protected tableName = 'obrigados'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('message').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('message')
    })
  }
}
