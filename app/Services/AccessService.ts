import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createHash } from 'crypto'

class AccessService {
  public static async currentUserId(auth: HttpContextContract['auth']): Promise<number | null> {
    let theCurrentUserId: number | null = null
    if (await auth.use('api').check()) {
      await auth.use('api').authenticate()
      theCurrentUserId = auth.use('api').user.id
    }
    return theCurrentUserId
  }

  public static generateToken(len: number): string {
    let text = ''
    let charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    for (let i = 0; i < len; i++)
      text += charset.charAt(Math.floor(Math.random() * charset.length))
    return text
  }

  public static hashSha256(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }
}

export default AccessService