import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'

import Affirmation from 'App/Models/Affirmation'

export default class AffirmationsController {

  public async home({ auth, request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(!(!!qs.page || !!qs.per_page)) {
        response.send({ failure: { message: 'Lack of data.' } })
        response.status(500)
        return response
      }
      const page = parseInt(qs.page)
      const perPage = parseInt(qs.per_page)

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
            COUNT(case when opinions.opinion_value = 1 then 1 end) as strongly_agree,
            COUNT(case when opinions.opinion_value = 0.5 then 0.5 end) as agree,
            COUNT(case when opinions.opinion_value = 0 then 0 end) as neutral,
            COUNT(case when opinions.opinion_value = -0.5 then -0.5 end) as disagree,
            COUNT(case when opinions.opinion_value = -1 then -1 end) as strongly_disagree,
            SUM(case when opinions.opinion_author = :opinionAuthor then opinions.opinion_value end) as opinion_value`, {
              opinionAuthor: currentUserId
            }
          )
        ).
        leftJoin('affirmations', 'opinions.affirmation_parent', '=', 'affirmations.id').
        groupBy('affirmations.id').
        paginate(page, perPage)

      if (responseDb?.length === 0) {
        response.send({ failure: { message: 'Affirmations not found.' } })
        response.status(404)
        return response
      }

      response.send({ success: { affirmations: responseDb?.toJSON()?.data } })
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'error get affirmations from home' } })
      response.status(500)
      return response
    }
  }

  public async trending({ response }: HttpContextContract) {
    try {
      const responseDb = await Database.
        from('opinions').
        select(
          'affirmations.id',
          'affirmations.message',
          Database.raw(`
            COUNT(case when opinions.opinion_value = 1 then 1 end) as strongly_agree,
            COUNT(case when opinions.opinion_value = 0.5 then 0.5 end) as agree,
            COUNT(case when opinions.opinion_value = 0 then 0 end) as neutral,
            COUNT(case when opinions.opinion_value = -0.5 then -0.5 end) as disagree,
            COUNT(case when opinions.opinion_value = -1 then -1 end) as strongly_disagree`
          )
        ).
        leftJoin('affirmations', 'opinions.affirmation_parent', '=', 'affirmations.id').
        where('opinions.updated_at', '>=', DateTime.local().minus({days: 1}).toSQL()).
        groupBy('affirmations.id').
        orderBy(Database.raw(`COUNT(opinions.opinion_value)`), 'desc')

      if (!responseDb[0]) {
        response.send({ failure: { message: 'affirmations not found' } })
        response.status(404)
        return response
      }

      response.send({ success: { affirmations: responseDb } })
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'error get affirmations from trending' } })
      response.status(500)
      return response
    }
  }

  public async search({ request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(!(!!qs?.search)) {
        response.send({ failure: { message: 'lack of data' }})
        response.status(500)
        return response
      }
      const search = String(qs.search)

      const responseDb = await Database
        .from('affirmations')
        .select('*')
        .where('message', 'like', '%'+ search +'%')

      if (responseDb?.length === 0) {
        response.send({ failure: { message: 'affirmations not found' } })
        response.status(404)
        return response
      }

      const affirmations = responseDb.map((affirmation: Affirmation) => {
        return { id: affirmation.id, message: affirmation.message }
      })

      response.send({ success: { affirmations } })
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'error get affirmations from search' } })
      response.status(500)
      return response
    }
  }

  public async affirmation({ auth, request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(!(!!qs?.affirmation_id)) {
        response.send({ failure: { message: 'lack of data' }})
        response.status(500)
        return response
      }
      const affirmationId = parseInt(qs.affirmation_id)

      // const affirmation = await Affirmation.find(affirmationId)
      // if (!affirmation) {
      //   response.send({ failure: { message: 'affirmation not found' } })
      //   response.status(404)
      //   return response
      // }

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
            COUNT(case when opinions.opinion_value = 1 then 1 end) as strongly_agree,
            COUNT(case when opinions.opinion_value = 0.5 then 0.5 end) as agree,
            COUNT(case when opinions.opinion_value = 0 then 0 end) as neutral,
            COUNT(case when opinions.opinion_value = -0.5 then -0.5 end) as disagree,
            COUNT(case when opinions.opinion_value = -1 then -1 end) as strongly_disagree,
            SUM(case when opinions.opinion_author = :opinionAuthor then opinions.id end) as opinion_id,
            SUM(case when opinions.opinion_author = :opinionAuthor then opinions.opinion_value end) as opinion_value`, {
              opinionAuthor: currentUserId
            }
          )
        ).
        leftJoin('affirmations', 'opinions.affirmation_parent', '=', 'affirmations.id').
        where('affirmations.id', affirmationId).
        groupBy('affirmations.id')

      if (responseDb?.length === 0) {
        response.send({ failure: { message: 'affirmation not found' } })
        response.status(404)
        return response
      }

      const affirmation = {
        id: parseInt(responseDb[0].id),
        message: responseDb[0].message,
        strongly_agree: parseInt(responseDb[0].strongly_agree),
        agree: parseInt(responseDb[0].agree),
        neutral: parseInt(responseDb[0].neutral),
        disagree: parseInt(responseDb[0].disagree),
        strongly_disagree: parseInt(responseDb[0].strongly_disagree),
        opinion: responseDb[0].opinion_id ? { id: parseInt(responseDb[0].opinion_id), value: parseInt(responseDb[0].opinion_value) } : null
      }

      response.send({ success: { affirmation } })
      response.status(200)
      return response
    }
    catch (err) {
      response.send({ failure: { message: 'Error get single affirmation.' } })
      response.status(500)
      return response
    }
  }


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

  public async create({ request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(!(!!qs?.affirmation_message)) {
        response.send({ failure: { message: 'lack of data' }})
        response.status(500)
        return response
      }
      const affirmationMessage = String(qs.affirmation_message)

      const affirmation = await Affirmation.create({ message: affirmationMessage })

      response.send({ success: { affirmation_id: affirmation.id } })
      response.status(200)
      return response
    }
    catch (err) {
      response.send({ failure: { message: 'error post affirmation' } })
      response.status(500)
      return response
    }
  }
}
