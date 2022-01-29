import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

import Opinion from 'App/Models/Opinion'
import User from 'App/Models/User'

export default class OpinionsController {

  public async user({ request, response }: HttpContextContract) {
    const qs = request.qs()
    if(!(!!qs.user_id)) {
      response.send({ error: 'falta de dados' })
      response.status(500)
      return response
    }
    const userId = parseInt(qs.user_id)

    const responseDb = await Database.
      from('opinions').
      select(
        'id',
        'affirmation_parent',
        Database.
          from('affirmations').
          select('message').
          whereColumn('opinions.affirmation_parent', 'affirmations.id').
          as('affirmation_message'),
        'strongly_agree',
        'agree',
        'neutral',
        'disagree',
        'strongly_disagree'
      ).
      whereNotNull('affirmation_parent').
      where('opinion_author', userId)

    return responseDb
  }

  public async affirmation({ request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(!(!!qs.affirmation_id)) {
        response.send({ error: 'falta de dados' })
        response.status(500)
        return response
      }
      const affirmationId = parseInt(qs.affirmation_id)

      const responseDb = await Database.
        from((subquery) => {
          subquery.
            from('opinions').
            select(
              'id',
              'opinion_author',
              'opinion_avaliation'
            ).
            where('affirmation_parent', affirmationId).
            as('opinions_db')
        }).
        select(
          'opinions_db.*',
          'user_login',
          'usermeta.meta_value as avatar'
        ).
        leftJoin('users', 'users.id', '=', 'opinions_db.opinion_author').
        leftJoin('usermeta', 'usermeta.user_id', '=', 'users.id').
        where((query) => {
          query.where('usermeta.meta_key', 'avatar')
        }).
        orWhere((query) => {
          query.whereNull('usermeta.meta_key')
        })

      response.send({ success: { opinions: responseDb } })
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'Error ao pegas as afirmações da home.' } })
      response.status(500)
      return response
    }
  }


  public async index() {
    const all = await Opinion.all()

    return all
  }

  public async show({ request, response }: HttpContextContract) {
    const opinionId: number = request.param('id')
    const opinion = await Opinion.findOrFail(opinionId)
    if (!opinion) {
      return response.notFound('Opinion not found.')
    }

    return opinion
  }

  public async addOrUpdate({ request, auth, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(!(!!qs.affirmation_id || !!qs.avaliation_value)) {
        response.send({ error: 'falta de dados' })
        response.status(500)
        return response
      }
      const affirmationId = parseInt(qs.affirmation_id)
      const avaliationValue = parseFloat(qs.avaliation_value)

      await auth.use('api').authenticate()
      const currentUserId: number = auth.use('api').user.id

      const obj = {
        opinionAuthor: currentUserId,
        affirmationParent: affirmationId,
        opinionAvaliation: avaliationValue
      }

      const responseDb = await Database.
        from('opinions').
        select('id').
        where('opinion_author', currentUserId).
        where('affirmation_parent', affirmationId)

      let opinionId = 0
      if(!!responseDb) {
        opinionId = parseInt(responseDb[0]?.id)
      }

      const opinion = await Opinion.updateOrCreate({ id: opinionId }, obj)

      response.send({ success: { opinion_id: opinion.id }})
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'Erro ao atualizar ou criar a opinião.' } })
      response.status(500)
      return response
    }
  }
}
