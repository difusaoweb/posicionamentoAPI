import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

import Affirmation from 'App/Models/Affirmation'

export default class AffirmationsController {
  public async index() {
    const all = await Affirmation.all()

    return all
  }

  public async indexHome() {
    const request = await Database
    .from('opinions')
    .select('id', 'affirmation_parent', 'evaluation',
      Database.from('affirmations')
      .select('message')
      .whereColumn('affirmations.id', 'opinions.affirmation_parent')
      .as('affirmation_message')
    )
    console.log(request)


    // affirmations.map((affirmation) => {
    //   console.log(affirmation.opinions)
    //   unset(affirmation.createdAt)
    //   return affirmation
    // })
    // opinions.forEach((affirmation) => {
    //   console.log(affirmation.opinions)
    // })


    return []
  }

  public async show({ request, response }: HttpContextContract) {
    const affirmationId: number = request.param('id')
    const affirmation = await Affirmation.findOrFail(affirmationId)
    if (!affirmation) {
      return response.notFound('Affirmation not found.')
    }

    return affirmation
  }

  public async store({ request }: HttpContextContract) {
    const newSchema = schema.create({
      message: schema.string()
    })
    const requestBody = await request.validate({ schema: newSchema })

    const affirmation = await Affirmation.create({
      message: requestBody.message
    })

    return affirmation
  }
}
