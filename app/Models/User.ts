import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { BaseModel, column, beforeSave, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'

import Opinion from 'App/Models/Opinion'


export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userLogin: string

  @column({ serializeAs: null })
  public userPass: string

  @column()
  public userEmail: string

  @column()
  public displayName: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.userPass) {
      user.userPass = await Hash.make(user.userPass)
    }
  }

  @hasMany(() => Opinion, {
    foreignKey: 'opinion_author',
  })
  public opinions: HasMany<typeof Opinion>
}
