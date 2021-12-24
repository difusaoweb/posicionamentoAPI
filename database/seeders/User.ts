import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'


export default class UserSeeder extends BaseSeeder {
  public async run() {
    await User.create({
      userLogin: Env.get('BUSINESS_ACCOUNT_USER_LOGIN'),
      userPass: Env.get('BUSINESS_ACCOUNT_USER_PASS'),
      userEmail: Env.get('BUSINESS_ACCOUNT_USER_EMAIL'),
      displayName: Env.get('BUSINESS_ACCOUNT_USER_DISPLAYNAME')
    })
  }
}
