import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import Database from '@ioc:Adonis/Lucid/Database'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'
import { DateTime } from 'luxon'

import ApiToken from 'App/Models/ApiToken'
import AccessService from 'App/Services/AccessService'

export default class AccessController {
  public async login({ auth, request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if (!qs?.login || !qs?.password) {
        response.send({ failure: { message: 'Lack of data.' }})
        response.status(500)
        return response
      }
      const login = String(qs.login)
      const password = String(qs.password)

      const responseDb = await Database.query().
        from('users').
        select('id').
        where('email', login).
        orWhere('username', login)

      if(responseDb.length == 0) {
        response.send({ failure: { message: 'User not found.' }})
        response.status(404)
        return response
      }

      const user = await User.findOrFail(responseDb[0].id)

      if (!(await Hash.verify(user.password, password))) {
        response.send({ failure: { message: 'Incorrect password.' }})
        response.status(403)
        return response
      }

      const token = await auth.use('api').generate(user, {
        name: 'login',
        expiresIn: '7days'
      })

      // const usermeta = await getUsermetaAll({ userId: user.id })

      // let avatarMeta: string | null = null
      // let titleMeta: string | null = null
      // let followersMeta: number | null = null
      // let descriptionMeta: string | null = null
      // if(!!usermeta) {
      //   avatarMeta = usermeta['avatar'] ?? null
      //   titleMeta = usermeta['title'] ?? null
      //   followersMeta = parseInt(usermeta['followers']) ?? null
      //   descriptionMeta = usermeta['description'] ?? null
      // }

      const returnResponse = {
        token: token.token,
        user: {
          id: user.id,
          username: user.username,
          display_name: user.displayName,
          email: user.email,
          // meta: {
          //   avatar: avatarMeta,
          //   title: titleMeta,
          //   followers: followersMeta,
          //   description: descriptionMeta
          // }
        }
      }

      response.send({ success: returnResponse })
      response.status(200)
      return response
    }
    catch(err) {
      console.log(err)
      response.send({ failure: { message: 'Error when sign in.' } })
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
      response.send({ failure: { message: 'Error logging out.' } })
      response.status(500)
      return response
    }
  }

  public async checkAuthenticated({ auth, response }: HttpContextContract) {
    try {
      await auth.use('api').authenticate()

      response.send({ success: { is_authenticated: auth.use('api').isAuthenticated } })
      response.status(200)
      return response
    }
    catch (err) {
      response.send({ failure: { message: 'Error checking authentication.' } })
      response.status(500)
      return response
    }
  }

  public async resetPassword({ request, response }: HttpContextContract) {
    function generateToken(len) {
      let text = ''
      let charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      for (let i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length))
      return text
    }

    try {
      const qs = request.qs()
      if(
        !(!!qs?.username)
      ) {
        response.send({ failure: { message: 'Lack of data.' }})
        response.status(500)
        return response
      }

      const lang = 'pt-BR' //pt-BR or en-UK
      const username = String(qs.username)

      const users = await Database.query().
        from('users').
        select('id').
        where((query) => {
          query.where('email', username)
        }).
        orWhere((query) => {
          query.where('username', username)
        })

      if(users.length == 0) {
        response.send({ failure: { message: 'User not found.' }})
        response.status(404)
        return response
      }
      const user = await User.findOrFail(users[0].id)

      const token = `${generateToken(3)}-${generateToken(3)}`
      const expiresAt: DateTime = DateTime.now().plus({hours: 2})

      const tokenObj = {
        userId: user.id,
        name: 'forgot-password',
        type: 'api',
        token,
        expiresAt: expiresAt
      }

      await ApiToken.create(tokenObj)

      const emailSubject = (lang == 'pt-BR') ? 'Redefinição de senha no Posicionamento' : 'Password reset on Posicionamento'

      await Mail.use('smtp').send((message) => {
        message
          .from(Env.get('EMAIL_FROM'))
          .to(user.email)
          .subject(emailSubject)
          .htmlView('emails/passwordReset', { lang, displayName: user.displayName, token })
      })

      response.send({ success: { is_send: true } })
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'Error forgot password.' } })
      response.status(500)
      return response
    }
  }

  public async resetPasswordChangePassword({ request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(
        !(!!qs?.token) ||
        !(!!qs?.password)
      ) {
        response.send({ failure: { message: 'Lack of data.' }})
        response.status(500)
        return response
      }

      const token = String(qs.token)
      const password = String(qs.password)

      const responseDb = await Database.query().
        from('api_tokens').
        select('user_id').
        where('token', token).
        andWhere('name', 'forgot-password')

      if(responseDb.length == 0) {
        response.send({ failure: { message: 'Token not found.' }})
        response.status(404)
        return response
      }

      const user = await User.findOrFail(responseDb[0].user_id)
      user.password = password
      await user.save()

      response.send({ success: { change_password: true } })
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'Error change password.' } })
      response.status(500)
      return response
    }
  }

  public async verifyCodeEmail({ auth, request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if (!qs?.token) {
        response.send({ failure: { message: 'Lack of data.' }})
        response.status(500)
        return response
      }
      const token = String(qs.token)

      const tokenHashSha256 = AccessService.hashSha256(token)

      const responseDb = await Database.query().
        from('api_tokens').
        select('user_id').
        where('token', tokenHashSha256).
        andWhere('name', 'verify-email')

      if (responseDb.length == 0) {
        response.send({ failure: { message: 'Token not found.' }})
        response.status(404)
        return response
      }

      const currentUserId = await AccessService.currentUserId(auth)
      const userId = responseDb[0].user_id

      if (currentUserId != userId) {
        response.send({ failure: { message: 'User not found.' }})
        response.status(404)
        return response
      }

      response.send({ success: { user_id: userId } })
      response.status(200)
      return response
    }
    catch (err) {
      console.log(err)
      response.send({ failure: { message: 'Error change password.' } })
      response.status(500)
      return response
    }
  }
}
