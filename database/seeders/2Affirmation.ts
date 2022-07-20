import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Affirmation from 'App/Models/Affirmation'

export default class AffirmationSeeder extends BaseSeeder {
  public async run() {
    await Affirmation.createMany([
      { message: 'Deus não existe.' },
      { message: 'Estado é guange.' },
      { message: 'Quem tá lendo é viado.' },
      { message: 'Boxe não é arte marcial.' },
    ])
  }
}
