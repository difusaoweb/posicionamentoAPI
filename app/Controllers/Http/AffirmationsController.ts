import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

import Affirmation from 'App/Models/Affirmation'

export default class AffirmationsController {
  public async index() {
    const all = await Affirmation.all()

    return all
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
