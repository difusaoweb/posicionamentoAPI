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

  public async home({ auth, request, response }: HttpContextContract) {
    try {
      let currentUserId: number = 0
      if(await auth.use('api').check()) {
        await auth.use('api').authenticate()
        currentUserId = auth.use('api').user.id
      }

      const responseDb = await Database.
        from('opinions').
        select(
          'affirmations.id',
          'affirmations.message',
          Database.raw(`
            COUNT(case when opinions.opinion_avaliation = 1 then 1 end) as strongly_agree,
            COUNT(case when opinions.opinion_avaliation = 0.5 then 0.5 end) as agree,
            COUNT(case when opinions.opinion_avaliation = 0 then 0 end) as neutral,
            COUNT(case when opinions.opinion_avaliation = -0.5 then -0.5 end) as disagree,
            COUNT(case when opinions.opinion_avaliation = -1 then -1 end) as strongly_disagree,
            SUM(case when opinions.opinion_author = :opinionAuthor then opinions.opinion_avaliation end) as opinion_avaliation`, {
              opinionAuthor: currentUserId
            }
          )
        ).
        leftJoin('affirmations', 'opinions.affirmation_parent', '=', 'affirmations.id').
        groupBy('affirmations.id')

      response.send({ success: { affirmations: responseDb } })
      response.status(200)
      return response
    }
    catch (error) {
      console.log(error?.responseText)
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
