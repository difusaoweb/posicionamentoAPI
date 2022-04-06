import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'
import { DateTime } from 'luxon'

import ApiToken from 'App/Models/ApiToken'
import { getUsermetaAll } from 'App/Controllers/Http/UsermetaController'

export default class AccessController {
  public async login({ auth, request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(
        !(!!qs?.user_login) ||
        !(!!qs?.user_pass)
      ) {
        response.send({ failure: { message: 'Lack of data.' }})
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
        response.send({ failure: { message: 'User not found.' }})
        response.status(404)
        return response
      }
      const user = await User.findOrFail(users[0].id)

      if (!(await Hash.verify(user.userPass, userPass))) {
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
          user_login: user.userLogin,
          display_name: user.displayName,
          user_email: user.userEmail,
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
    catch (error) {
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

  public async resetPassword({ auth, request, response }: HttpContextContract) {
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
        !(!!qs?.user_login)
      ) {
        response.send({ failure: { message: 'Lack of data.' }})
        response.status(500)
        return response
      }

      const lang = 'pt-BR' //pt-BR or en-UK
      const userLogin = String(qs.user_login)

      const users = await Database.query().
        from('users').
        select('id').
        where((query) => {
          query.where('user_email', userLogin)
        }).
        orWhere((query) => {
          query.where('user_login', userLogin)
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
          .to(user.userEmail)
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

  public async resetPasswordVerifyCode({ auth, request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(
        !(!!qs?.token)
      ) {
        response.send({ failure: { message: 'Lack of data.' }})
        response.status(500)
        return response
      }

      const token = String(qs.token)

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

      const user = await User.find(responseDb[0].user_id)
      if(!user) {
        response.send({ failure: { message: 'User not found.' }})
        response.status(404)
        return response
      }

      response.send({ success: { user_id: user.id } })
      response.status(200)
      return response
    }
    catch (error) {
      response.send({ failure: { message: 'Error change password.' } })
      response.status(500)
      return response
    }
  }

  public async resetPasswordChangePassword({ auth, request, response }: HttpContextContract) {
    try {
      const qs = request.qs()
      if(
        !(!!qs?.token) ||
        !(!!qs?.user_pass)
      ) {
        response.send({ failure: { message: 'Lack of data.' }})
        response.status(500)
        return response
      }

      const token = String(qs.token)
      const userPass = String(qs.user_pass)

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
      user.userPass = userPass
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
}
