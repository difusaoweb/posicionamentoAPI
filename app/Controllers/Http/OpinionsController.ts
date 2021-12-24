import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

import Opinion from 'App/Models/Opinion'
import User from 'App/Models/User'

export default class OpinionsController {
  public async index() {
    const all = await Opinion.all()

    return all
  }

  public async show({ request }: HttpContextContract) {
    const opinionId: number = request.param('id')
    const opinion = await Opinion.findOrFail(opinionId)

    return opinion
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

    const opinion = await Opinion.create({
      senderId: currentUserId,
      receiverId: receiverUser.id,
      value: requestBody.value,
      message: requestBody.message,
    })

    return opinion
  }

  public async destroy({ auth, request, response }: HttpContextContract) {
    const opinionId: number = request.param('id')
    const opinion = await Opinion.find(opinionId)
    if (!opinion) {
      return response.notFound('Opinion não econtrado')
    }

    await auth.use('api').authenticate()
    const currentUserId: number = auth.use('api').user.id

    if (opinion.senderId != currentUserId) {
      return response.unauthorized('Você não é o remetente')
    }

    const currentUser = await User.find(currentUserId)
    if (!currentUser) {
      return response.notFound('Usuário não econtrado.')
    }

    const receiverUser = await User.find(opinion.receiverId)
    if (!receiverUser) {
      return response.notFound('Usuário não econtrado.')
    }

    currentUser.amount += opinion.value
    receiverUser.amount -= opinion.value

    currentUser.save()
    receiverUser.save()

    await opinion.delete()
  }
}
