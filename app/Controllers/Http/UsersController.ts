import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import Mail from '@ioc:Adonis/Addons/Mail'
import { DateTime } from 'luxon'
import Env from '@ioc:Adonis/Core/Env'

import ApiToken from 'App/Models/ApiToken'
import User from 'App/Models/User'
import AccessService from 'App/Services/AccessService'

export default class UsersController {

  public async create({ request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if (!qs?.username || !qs?.password || !qs?.email || !qs?.display_name) {
        response.send({ failure: { message: 'Lack of data.' }})
        response.status(500)
        return response
      }
      const username = String(qs.username)
      const password = String(qs.password)
      const email = String(qs.email)
      const displayName = String(qs.display_name)

      const responseDb = await Database.
        from('users').
        select('id').
        where('username', username).
        orWhere('email', email)

      if(responseDb.length == 1) {
        response.send({ failure: { message: 'User already exists.' }})
        response.status(409)
        return response
      }

      const user = await User.create({
        username,
        password,
        email,
        displayName
      })

      const token = `${AccessService.generateToken(3)}-${AccessService.generateToken(3)}`
      const tokenHashSha256 = AccessService.hashSha256(token)
      const expiresAt: DateTime = DateTime.now().plus({hours: 2})

      const theTokenObj = {
        userId: user.id,
        name: 'verify-email',
        type: 'api',
        token: tokenHashSha256,
        expiresAt: expiresAt
      }

      await ApiToken.create(theTokenObj)

      const lang = 'pt-BR' //pt-BR or en-UK
      const emailSubject = (lang == 'pt-BR') ? 'Por favor verifique seu e-mail.' : 'Please verify your email.'

      await Mail.use('smtp').send((message) => {
        message
          .from(Env.get('EMAIL_FROM'))
          .to(user.email)
          .subject(emailSubject)
          .htmlView('emails/verify', { lang, displayName: user.displayName, token })
      })

      response.send({ success: { user_id: user.id } })
      response.status(200)
      return response
    }
    catch (err) {
      console.log(err)
      response.send({ failure: { message: 'Error creating user.' } })
      response.status(500)
      return response
    }
  }

  public async show({ request, response }: HttpContextContract) {
    const userId: number = request.param('id')
    const user = await User.findOrFail(userId)
    if (!user) {
      return response.notFound('Usuário não econtrado.')
    }

    return user
  }

  public async profile({ request, response }: HttpContextContract) {
    const qs = request.qs()
    if(!(!!qs.user_id)) {
      response.send({ error: 'falta de dados' })
      response.status(500)
      return response
    }
    const userId = parseInt(qs.user_id)

    const user = await User.findOrFail(userId)
    if (!user) {
      response.send({ error: 'Usuário não econtrado.' })
      response.status(404)
      return response
    }

    const userMetas = await getUsermetaAll({ userId })

    let avatarMeta: string | null = null
    let titleMeta: string | null = null
    let followersMeta: number | null = null
    let descriptionMeta: string | null = null
    if(!!userMetas) {
      avatarMeta = userMetas['avatar'] ?? null
      titleMeta = userMetas['title'] ?? null
      followersMeta = parseInt(userMetas['followers']) ?? null
      descriptionMeta = userMetas['description'] ?? null
    }

    return {
      username: user.username,
      displayName: user.displayName,
      avatar: avatarMeta,
      title: titleMeta,
      followers: followersMeta,
      description: descriptionMeta
    }
  }

  public async update({ request, response }: HttpContextContract) {
    const userId: number = request.param('id')
    const user = await User.findOrFail(userId)
    if (!user) {
      return response.notFound('Usuário não econtrado.')
    }

    const newSchema = schema.create({
      username: schema.string(),
      password: schema.string(),
      email: schema.string(),
      display_name: schema.string(),
    })
    const requestBody = await request.validate({ schema: newSchema })

    let userObj = {
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      password: user.password
    }

    //username
    if (requestBody.username) {
      if (requestBody.username != user.username) {
        const searchUserLogin = await User.findBy('username', requestBody.username)
        if (searchUserLogin) {
          return response.notFound('username já está em uso.')
        }

        userObj.username = requestBody.username
      }
    }
    //username

    //email
    if (requestBody.email) {
      if (requestBody.email != user.email) {
        const searchUserEmail = await User.findBy('email', requestBody.email)
        if (searchUserEmail) {
          return response.notFound('email já está em uso.')
        }

        userObj.email = requestBody.email
      }
    }
    //email

    if (requestBody.display_name) {
      userObj.displayName = requestBody.display_name
    }

    if (requestBody.password) {
      userObj.password = requestBody.password
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
