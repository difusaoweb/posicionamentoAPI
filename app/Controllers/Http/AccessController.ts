import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

export default class AccessController {
  public async login({ auth, request, response }: HttpContextContract) {
    const newSchema = schema.create({
      user_login: schema.string(),
      user_pass: schema.string()
    })
    const requestBody = await request.validate({ schema: newSchema })

    const users = await Database.query().from('users')
    .where((query) => {
      query.where('user_email', requestBody.user_login)
    })
    .orWhere((query) => {
      query.where('user_login', requestBody.user_login)
    })
    if (!users[0]) {
      return response.abort('User not found', 404)
    }

    const user = await User.findOrFail(users[0].id)
    if (!user) {
      return response.abort('User not found', 404)
    }
    if (!(await Hash.verify(user.userPass, requestBody.user_pass))) {
      return response.badRequest('Invalid password')
    }

    const token = await auth.use('api').generate(user, {
      name: user.displayName,
      expiresIn: '7days'
    })

    const returnResponse = {
      token: token.token,
      user: {
        id: user.id,
        user_login: user.userLogin,
        display_name: user.displayName,
        user_email: user.userEmail
      }
    }
    return returnResponse
  }

  public async logout({ auth }: HttpContextContract) {
    await auth.use('api').revoke()
    return {
      revoked: true
    }
  }

  public async resetpassword({ auth, request, response }: HttpContextContract) {
    const newSchema = schema.create({
      user_email: schema.string()
    })
    const requestBody = await request.validate({ schema: newSchema })

    const user = await User.findByOrFail('user_email', requestBody.user_email)
    if (!user) {
      return response.abort('User not found', 404)
    }


  }

  // public async changepassword({ auth, request, response }: HttpContextContract) { }
}
