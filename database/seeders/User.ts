import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await User.create({
      userLogin: 'obrigado',
      userPass: 'eQ^N*CWs@ZY8osql0@hA',
      userEmail: 'obrigadoinc@gmail.com',
      displayName: 'Obrigado',
      amount: 10000000000,
    })
  }
}
