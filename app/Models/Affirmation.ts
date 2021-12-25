import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'

import Opinion from 'App/Models/Opinion'


export default class Affirmation extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public message: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Opinion, {
    foreignKey: 'affirmation_parent',
  })
  public opinions: HasMany<typeof Opinion>
}
