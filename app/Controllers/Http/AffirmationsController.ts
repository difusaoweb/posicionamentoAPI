import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

import Affirmation from 'App/Models/Affirmation'
import User from 'App/Models/User'

export default class AffirmationsController {
  public async index() {
    const all = await Affirmation.all()

    return all
  }

  public async show({ request }: HttpContextContract) {
    const affirmationId: number = request.param('id')
    const affirmation = await Affirmation.findOrFail(affirmationId)

    return affirmation
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const newSchema = schema.create({
      receiver_id: schema.number(),
      value: schema.number(),
      message: schema.string(),
    })
    const requestBody = await request.validate({ schema: newSchema })

    await auth.use('api').authenticate()
    const currentUserId: number = auth.use('api').user.id
    const currentUser = await User.find(currentUserId)
    if (!currentUser) {
      return response.notFound('Usuário não econtrado.')
    }

    const receiverUser = await User.find(requestBody.receiver_id)
    if (!receiverUser) {
      return response.notFound('Usuário não econtrado.')
    }

    currentUser.amount -= requestBody.value
    receiverUser.amount += requestBody.value

    currentUser.save()
    receiverUser.save()

    const affirmation = await Affirmation.create({
      senderId: currentUserId,
      receiverId: receiverUser.id,
      value: requestBody.value,
      message: requestBody.message,
    })

    return affirmation
  }

  public async destroy({ auth, request, response }: HttpContextContract) {
    const affirmationId: number = request.param('id')
    const affirmation = await Affirmation.find(affirmationId)
    if (!affirmation) {
      return response.notFound('Affirmation não econtrado')
    }

    await auth.use('api').authenticate()
    const currentUserId: number = auth.use('api').user.id

    if (affirmation.senderId != currentUserId) {
      return response.unauthorized('Você não é o remetente')
    }

    const currentUser = await User.find(currentUserId)
    if (!currentUser) {
      return response.notFound('Usuário não econtrado.')
    }

    const receiverUser = await User.find(affirmation.receiverId)
    if (!receiverUser) {
      return response.notFound('Usuário não econtrado.')
    }

    currentUser.amount += affirmation.value
    receiverUser.amount -= affirmation.value

    currentUser.save()
    receiverUser.save()

    await affirmation.delete()
  }
}
