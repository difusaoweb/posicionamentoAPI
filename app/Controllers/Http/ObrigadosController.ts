import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

import Obrigado from 'App/Models/Obrigado'
import User from 'App/Models/User'

export default class ObrigadosController {
  public async index() {
    const all = await Obrigado.all()

    return all
  }

  public async show({ request }: HttpContextContract) {
    const obrigadoId: number = request.param('id')
    const obrigado = await Obrigado.findOrFail(obrigadoId)

    return obrigado
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

    const obrigado = await Obrigado.create({
      senderId: currentUserId,
      receiverId: receiverUser.id,
      value: requestBody.value,
      message: requestBody.message,
    })

    return obrigado
  }

  public async destroy({ auth, request, response }: HttpContextContract) {
    const obrigadoId: number = request.param('id')
    const obrigado = await Obrigado.find(obrigadoId)
    if (!obrigado) {
      return response.notFound('Obrigado não econtrado')
    }

    await auth.use('api').authenticate()
    const currentUserId: number = auth.use('api').user.id

    if (obrigado.senderId != currentUserId) {
      return response.unauthorized('Você não é o remetente')
    }

    const currentUser = await User.find(currentUserId)
    if (!currentUser) {
      return response.notFound('Usuário não econtrado.')
    }

    const receiverUser = await User.find(obrigado.receiverId)
    if (!receiverUser) {
      return response.notFound('Usuário não econtrado.')
    }

    currentUser.amount += obrigado.value
    receiverUser.amount -= obrigado.value

    currentUser.save()
    receiverUser.save()

    await obrigado.delete()
  }
}
