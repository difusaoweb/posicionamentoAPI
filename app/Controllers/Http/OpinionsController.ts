import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

import Opinion from 'App/Models/Opinion'

export default class OpinionsController {
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

  public async store({ request, auth, response }: HttpContextContract) {
    const newSchema = schema.create({
      evaluation: schema.number(),
      affirmation_parent: schema.number.optional(),
      opinion_parent: schema.number.optional()
    })
    const requestBody = await request.validate({ schema: newSchema })

    await auth.use('api').authenticate()
    const currentUserId: number = auth.use('api').user.id

    const opinion = await Opinion.create({
      opinionAuthor: currentUserId,
      evaluation: requestBody.evaluation,
      affirmationParent: requestBody.affirmation_parent ?? null,
      opinionParent: requestBody.opinion_parent ?? null
    })

    return opinion
  }
}
