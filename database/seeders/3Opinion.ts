import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Opinion from 'App/Models/Opinion'

export default class OpinionSeeder extends BaseSeeder {
  public async run() {
    await Opinion.createMany([
      {
        opinionAuthor: 1,
        opinionValue: -0.5,
        affirmationParent: 1
      },
      {
        opinionAuthor: 2,
        opinionValue: 0.5,
        affirmationParent: 2
      },
      {
        opinionAuthor: 1,
        opinionValue: 1,
        affirmationParent: 3
      },
      {
        opinionAuthor: 2,
        opinionValue: -1,
        affirmationParent: 3
      },
      {
        opinionAuthor: 1,
        opinionValue: 0,
        affirmationParent: 4
      },
      {
        opinionAuthor: 2,
        opinionValue: 0,
        affirmationParent: 4
      }
    ])
  }
}
