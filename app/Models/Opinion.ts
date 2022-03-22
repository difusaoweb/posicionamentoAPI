import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'

import User from 'App/Models/User'
import Affirmation from 'App/Models/Affirmation'


export default class Opinion extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public opinionAuthor: number

  @column()
  public opinionValue: number

  @column()
  public affirmationParent: number | null

  @column()
  public opinionParent: number | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Opinion, {
    foreignKey: 'opinion_parent',
  })
  public opinions: HasMany<typeof Opinion>

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => Affirmation, {
    foreignKey: 'opinion_parent',
  })
  public affirmation: HasMany<typeof Affirmation>
}
