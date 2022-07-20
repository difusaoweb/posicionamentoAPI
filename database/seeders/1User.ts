import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await User.createMany([
      {
        username: Env.get('BUSINESS_ACCOUNT_USERNAME'),
        password: Env.get('BUSINESS_ACCOUNT_PASSWORD'),
        email: Env.get('BUSINESS_ACCOUNT_EMAIL'),
        displayName: Env.get('BUSINESS_ACCOUNT_DISPLAY_NAME')
      },
      {
        username: 'wiatagan',
        password: '123',
        email: 'pazwiatagan@gmail.com',
        displayName: 'Wiatagan Paz'
      },
    ])
  }
}
