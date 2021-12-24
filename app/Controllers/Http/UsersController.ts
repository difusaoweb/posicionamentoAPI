import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Env from '@ioc:Adonis/Core/Env'

import User from 'App/Models/User'
import Obrigado from 'App/Models/Obrigado'

export default class UsersController {
  public async index() {
    const all = await User.all()

    return all
  }

  public async show({ request, response }: HttpContextContract) {
    const userId: number = request.param('id')
    const user = await User.findOrFail(userId)
    if (!user) {
      return response.notFound('Usuário não econtrado.')
    }

    return user
  }

  public async store({ request }: HttpContextContract) {
    const newSchema = schema.create({
      user_login: schema.string(),
      user_pass: schema.string(),
      user_email: schema.string(),
      display_name: schema.string(),
    })
    const requestBody = await request.validate({ schema: newSchema })

    const user = await User.create({
      userLogin: requestBody.user_login,
      userPass: requestBody.user_pass,
      userEmail: requestBody.user_email,
      displayName: requestBody.display_name,
    })

    const obrigadoUser = await User.findByOrFail(
      'user_login',
      Env.get('BUSINESS_ACCOUNT_USER_NAME')
    )

    obrigadoUser.amount -= 3
    user.amount += 3

    obrigadoUser.save()
    user.save()

    await Obrigado.create({
      senderId: obrigadoUser.id,
      receiverId: user.id,
      value: 3,
      message: 'Muito obrigado por vir para nossa plataforma!',
    })

    return user
  }

  public async update({ request, response }: HttpContextContract) {
    const userId: number = request.param('id')
    const user = await User.findOrFail(userId)
    if (!user) {
      return response.notFound('Usuário não econtrado.')
    }

    const newSchema = schema.create({
      user_login: schema.string(),
      user_pass: schema.string(),
      user_email: schema.string(),
      display_name: schema.string(),
    })
    const requestBody = await request.validate({ schema: newSchema })

    let userObj = {}

    //userLogin
    if (requestBody.user_login) {
      if (requestBody.user_login != user.userLogin) {
        const searchUserLogin = await User.findBy('user_login', requestBody.user_login)
        if (searchUserLogin) {
          return response.notFound('userLogin já está em uso.')
        }

        userObj.userLogin = requestBody.user_login
      }
    }
    //userLogin

    //userEmail
    if (requestBody.user_email) {
      if (requestBody.user_email != user.userEmail) {
        const searchUserEmail = await User.findBy('user_email', requestBody.user_email)
        if (searchUserEmail) {
          return response.notFound('userEmail já está em uso.')
        }

        userObj.userEmail = requestBody.user_email
      }
    }
    //userEmail

    if (requestBody.display_name) {
      userObj.displayName = requestBody.display_name
    }

    if (requestBody.user_pass) {
      userObj.userPass = requestBody.user_pass
    }

    const theUser = await User.updateOrCreate({ id: userId }, userObj)

    return theUser
  }

  public async destroy({ request }: HttpContextContract) {
    const userId: number = request.param('id')
    const user = await User.find(userId)
    if (user) {
      await user.delete()
    }
  }
}
