import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

import User from 'App/Models/User'
import Affirmation from 'App/Models/Affirmation'


export default class Opinion extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public opinion_author: number

  @column()
  public evaluation: number

  @column()
  public affirmation_parent: number

  @column()
  public opinion_parent: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Affirmation)
  public affirmation: BelongsTo<typeof Affirmation>

  @belongsTo(() => Opinion)
  public opinion: BelongsTo<typeof Opinion>
}
