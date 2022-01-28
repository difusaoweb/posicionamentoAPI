import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

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

  public async home({ request, response }: HttpContextContract) {
    try {
      const responseDb = await Database
        .from('opinions')
        .select('affirmations.id', 'affirmations.message')
        .count({
          'strongly_agree': 'strongly_agree',
          'agree': 'agree',
          'neutral': 'neutral',
          'disagree': 'disagree',
          'strongly_disagree': 'strongly_disagree'
        })
        .leftJoin('affirmations', 'opinions.affirmation_parent', '=', 'affirmations.id')
        .whereNotNull('affirmation_parent')
        .groupBy('affirmations.id')

      response.send({ success: { affirmations: responseDb } })
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'Error ao pegas as afirmações da home.' } })
      response.status(500)
      return response
    }
  }

  public async search({ request, response }: HttpContextContract) {
    const newSchema = schema.create({
      search: schema.string()
    })
    const requestBody = await request.validate({ schema: newSchema })

    const requestDb = await Database
    .from('affirmations')
    .select('*')
    .where('message', 'like', '%'+ requestBody.search +'%')

    return requestDb
  }
}
