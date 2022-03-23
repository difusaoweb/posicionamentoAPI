import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

import Opinion from 'App/Models/Opinion'
import User from 'App/Models/User'
import Affirmation from 'App/Models/Affirmation'

export default class OpinionsController {

  public async addOrUpdate({ request, auth, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(!(!!qs.affirmation_id || !!qs.opinion_value)) {
        response.send({ failure: { message: 'Lack of data.' } })
        response.status(500)
        return response
      }
      const affirmationId = parseInt(qs.affirmation_id)
      const opinionValue = parseFloat(qs.opinion_value)

      if(!(
        opinionValue == 1 ||
        opinionValue == 0.5 ||
        opinionValue == 0 ||
        opinionValue == -0.5 ||
        opinionValue == -1
      )) {
        response.send({ failure: { message: 'Invalid opinion value.' } })
        response.status(500)
        return response
      }

      const affirmation = await Affirmation.find(affirmationId)
      if (!affirmation) {
        response.send({ failure: { message: 'Affirmation not found.' } })
        response.status(404)
        return response
      }

      await auth.use('api').authenticate()
      const currentUserId: number = auth.use('api').user.id

      const obj = {
        opinionAuthor: currentUserId,
        affirmationParent: affirmationId,
        opinionValue: opinionValue
      }

      const responseDb = await Database.
        from('opinions').
        select('id').
        where('opinion_author', currentUserId).
        where('affirmation_parent', affirmationId)

      let opinionId = 0
      if(responseDb.length == 0) {
        const opinion = await Opinion.create(obj)
        opinionId = opinion.id
      }
      else {
        const opinion = await Opinion.updateOrCreate({ id: parseInt(responseDb[0]?.id) }, obj)
        opinionId = opinion.id
      }

      response.send({ success: { opinion_id: opinionId }})
      response.status(200)
      return response
    }
    catch (err) {
      console.log(err)

      response.send({ failure: { message: 'Error post or put opinions from affirmation.' } })
      response.status(500)
      return response
    }
  }

  public async destroy({ request, auth, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(!(!!qs.opinion_id)) {
        response.send({ failure: { message: 'Lack of data.' } })
        response.status(500)
        return response
      }
      const opinionId = parseInt(qs.opinion_id)

      const opinion = await Opinion.find(opinionId)
      if (!opinion) {
        response.send({ failure: { message: 'Opinion not found.' } })
        response.status(404)
        return response
      }

      await auth.use('api').authenticate()
      const currentUserId: number = auth.use('api').user.id

      if(currentUserId != opinion.opinionAuthor) {
        response.send({ failure: { message: 'Current user is forbidden from destroy to opinion.' } })
        response.status(403)
        return response
      }

      await opinion.delete()

      response.send({ success: { deleted: true }})
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'Error delete opinion from affirmation.' } })
      response.status(500)
      return response
    }
  }

  public async affirmation({ request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(!(!!qs.affirmation_id)) {
        response.send({ failure: { message: 'lack of data' } })
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
              'opinion_value'
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

      if (responseDb?.length === 0) {
        response.send({ failure: { message: 'opinions not found' } })
        response.status(404)
        return response
      }

      response.send({ success: { opinions: responseDb } })
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'error get opinions from affirmation' } })
      response.status(500)
      return response
    }
  }

  public async user({ request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(!(!!qs.user_id)) {
        response.send({ failure: { message: 'lack of data' } })
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
          'opinion_value'
        ).
        whereNotNull('affirmation_parent').
        where('opinion_author', userId)

      if (responseDb?.length === 0) {
        response.send({ failure: { message: 'opinions not found' } })
        response.status(404)
        return response
      }

      response.send({ success: { opinions: responseDb } })
      response.status(200)
      return response
    }
    catch (err) {
      response.send({ failure: { message: 'error get opinions from user' } })
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
}
