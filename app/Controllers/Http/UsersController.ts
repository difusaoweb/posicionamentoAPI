import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import Mail from '@ioc:Adonis/Addons/Mail'

import User from 'App/Models/User'
import { getUsermetaAll } from 'App/Controllers/Http/UsermetaController'

export default class UsersController {

  public async create({ auth, request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(
        !(!!qs?.user_login) ||
        !(!!qs?.user_pass) ||
        !(!!qs?.user_email) ||
        !(!!qs?.display_name)
      ) {
        response.send({ failure: { message: 'Lack of data.' }})
        response.status(500)
        return response
      }

      const userLogin = String(qs.user_login)
      const userPass = String(qs.user_pass)
      const userEmail = String(qs.user_email)
      const displayName = String(qs.display_name)

      const responseDb = await Database.
        from('users').
        select('id').
        where('user_login', userLogin).
        where('user_email', userEmail)

      if(responseDb.length == 1) {
        response.send({ failure: { message: 'User already exists.' }})
        response.status(500)
        return response
      }

      const user = {
        userLogin,
        userPass,
        userEmail,
        displayName
      }

      // const user = await User.create({
      //   userLogin,
      //   userPass,
      //   userEmail,
      //   displayName
      // })

      const token = await auth.use('api').generate(user, {
        name: user.displayName,
        expiresIn: '2hours'
      })

      const token = 'as4d5a4s56d4as56d4as56d4a6s54d5as4'
      const url = `google.com/login?token=${token}`

      await Mail.use('smtp').send((message) => {
        message
          .from('inc@difusaoweb.com')
          .to(userEmail)
          .subject('Please verify your email')
          .htmlView('emails/verify', { user, url })
      })

      // response.send({ success: { user_id: user.id } })
      response.send({ success: { user_id: 1 } })
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'Error ao criar o usuário.' } })
      response.status(500)
      return response
    }
  }



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
      userLogin: user.userLogin,
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
      user_login: schema.string(),
      user_pass: schema.string(),
      user_email: schema.string(),
      display_name: schema.string(),
    })
    const requestBody = await request.validate({ schema: newSchema })

    let userObj = {
      userLogin: user.userLogin,
      userEmail: user.userEmail,
      displayName: user.displayName,
      userPass: user.userPass
    }

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
