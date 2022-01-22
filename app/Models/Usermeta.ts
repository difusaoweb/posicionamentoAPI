import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Usermeta extends BaseModel {
  public static table = 'usermeta'

  @column({ isPrimary: true })
  public metaId: number

  @column()
  public userId: number

  @column()
  public metaKey: string | null

  @column()
  public metaValue: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
