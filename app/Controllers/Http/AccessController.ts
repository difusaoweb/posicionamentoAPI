import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

import { getUsermetaAll } from 'App/Controllers/Http/UsermetaController'

export default class AccessController {
  public async login({ auth, request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(
        !(!!qs?.user_login) ||
        !(!!qs?.user_pass)
      ) {
        response.send({ failure: { message: 'Falta de dados.' }})
        response.status(500)
        return response
      }

      const userLogin = String(qs.user_login)
      const userPass = String(qs.user_pass)

      const users = await Database.query().
        from('users').
        select('id').
        where((query) => {
          query.where('user_email', userLogin)
        }).
        orWhere((query) => {
          query.where('user_login', userLogin)
        })

      if(!(!!users[0]?.id)) {
        response.send({ failure: { message: 'Usuário não encontrado.' }})
        response.status(404)
        return response
      }
      const user = await User.findOrFail(users[0].id)

      if (!(await Hash.verify(user.userPass, userPass))) {
        response.send({ failure: { message: 'Senha incorreta.' }})
        response.status(403)
        return response
      }

      const token = await auth.use('api').generate(user, {
        name: user.displayName,
        expiresIn: '7days'
      })

      const usermeta = await getUsermetaAll({ userId: user.id })

      let avatarMeta: string | null = null
      let titleMeta: string | null = null
      let followersMeta: number | null = null
      let descriptionMeta: string | null = null
      if(!!usermeta) {
        avatarMeta = usermeta['avatar'] ?? null
        titleMeta = usermeta['title'] ?? null
        followersMeta = parseInt(usermeta['followers']) ?? null
        descriptionMeta = usermeta['description'] ?? null
      }

      const returnResponse = {
        token: token.token,
        user: {
          id: user.id,
          user_login: user.userLogin,
          display_name: user.displayName,
          user_email: user.userEmail,
          meta: {
            avatar: avatarMeta,
            title: titleMeta,
            followers: followersMeta,
            description: descriptionMeta
          }
        }
      }

      response.send({ success: returnResponse })
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'Error ao criar o usuário.' } })
      response.status(500)
      return response
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    try {
      await auth.use('api').revoke()

      response.send({ success: { revoked: true } })
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'Error ao deslogar.' } })
      response.status(500)
      return response
    }
  }

  // public async resetpassword({ auth, request, response }: HttpContextContract) {
  //   const newSchema = schema.create({
  //     user_email: schema.string()
  //   })
  //   const requestBody = await request.validate({ schema: newSchema })

  //   const user = await User.findByOrFail('user_email', requestBody.user_email)
  //   if (!user) {
  //     return response.abort('User not found', 404)
  //   }
  // }

  // public async changepassword({ auth, request, response }: HttpContextContract) { }

  public async checkAuthenticated({ auth, response }: HttpContextContract) {
    try {
      await auth.use('api').authenticate()

      response.send({ success: { isAuthenticated: auth.use('api').isAuthenticated } })
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'Error ao checar o autenticação.' } })
      response.status(500)
      return response
    }
  }

}
