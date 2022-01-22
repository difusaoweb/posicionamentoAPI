import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

import User from 'App/Models/User'
import Usermeta from 'App/Models/Usermeta'

interface GetUsermetaAllparameters {
  userId: number
}
// interface GetUsermetaAllReturnSingle {
//   meta_key: string
//   meta_value: any
// }

// meta_key: 'title', meta_value: 'Cristão'
// title: 'Cristão'

interface GetUsermetaparameters {
  userId: number
  metaKey: string
}
interface SetUsermetaparameters extends GetUsermetaparameters {
  metaValue: string
}

export default class UsermetaController {
  public async getUsermetaM({ request, response }: HttpContextContract) {
    const qs = request.qs()
    if(!(!!qs.user || !!qs.key)) {
      response.send({ error: 'falta de dados' })
      response.status(500)
      return response
    }
    const userId = parseInt(qs.user)
    const metaKey = String(qs.key)

    const getUsermetaR = await getUsermeta({ userId, metaKey })
    if(getUsermetaR) {
      response.send({ meta_value: getUsermetaR })
      response.status(200)
      return response
    }
    response.send({ error: true })
    response.status(500)
    return response
  }

  public async addUsermetaM({ request, response }: HttpContextContract) {
    const qs = request.qs()
    if(!(!!qs.user || !!qs.key || !!qs.value)) {
      response.send({ error: 'falta de dados' })
      response.status(500)
      return response
    }
    const userId = parseInt(qs.user)
    const metaKey = String(qs.key)
    const metaValue = String(qs.value)

    const addUsermetaR = await addUsermeta({ userId, metaKey, metaValue })
    if(addUsermetaR) {
      response.send({ success: true })
      response.status(200)
      return response
    }
    response.send({ error: true })
    response.status(500)
    return response
  }

  public async updateUsermetaM({ request, response }: HttpContextContract) {
    const qs = request.qs()
    if(!(!!qs.user || !!qs.key || !!qs.value)) {
      response.send({ error: 'falta de dados' })
      response.status(500)
      return response
    }
    const userId = parseInt(qs.user)
    const metaKey = String(qs.key)
    const metaValue = String(qs.value)

    const updateUsermetaR = await updateUsermeta({ userId, metaKey, metaValue })
    if(updateUsermetaR) {
      response.send({ success: true })
      response.status(200)
      return response
    }
    response.send({ error: true })
    response.status(500)
    return response
  }

  public async deleteUsermetaM({ request, response }: HttpContextContract) {
    const qs = request.qs()
    if(!(!!qs.user || !!qs.key)) {
      response.send({ error: 'falta de dados' })
      response.status(500)
      return response
    }
    const userId = parseInt(qs.user)
    const metaKey = String(qs.key)

    const deleteUsermetaR = await deleteUsermeta({ userId, metaKey })
    if(deleteUsermetaR) {
      response.send({ success: true })
      response.status(200)
      return response
    }
    response.send({ error: true })
    response.status(500)
    return response
  }
}



export const getUsermetaAll = async ({ userId }: GetUsermetaAllparameters): Promise<any[] | null> => {
  try {

    const responseDb = await Database.
      from('usermeta').
      select('meta_key', 'meta_value').
      where('user_id', userId)

    if(!!responseDb) {
      let responseArray = []

      responseDb.map((meta) => {
        const key: string = meta?.meta_key ?? null
        responseArray[key] = JSON.parse(meta?.meta_value) ?? null
      })

      return responseArray
    }
  }
  catch(err) {
    return null
  }
  return null
}

export const getUsermeta = async ({ userId, metaKey }: GetUsermetaparameters): Promise<string | null> => {
  try {

    const responseDb = await Database.
      from('usermeta').
      select('meta_value').
      where('user_id', userId).
      where('meta_key', metaKey)

    if(!!responseDb[0]) {
      return JSON.parse(responseDb[0]?.meta_value)
    }
  }
  catch(err) {
    return null
  }
  return null
}

export const addUsermeta = async ({ userId, metaKey, metaValue }: SetUsermetaparameters): Promise<number | null> => {
  try {
    const obj = { userId, metaKey, metaValue: JSON.stringify(metaValue) }

    const responseDb = await Database.
      from('usermeta').
      select('meta_id').
      where('user_id', userId).
      where('meta_key', metaKey)

    if(!(!!responseDb[0])) {
      const usermeta = await Usermeta.create(obj)
      return usermeta.metaId
    }
  }
  catch(error) {
    return null
  }
  return null
}

export const updateUsermeta = async ({ userId, metaKey, metaValue }: SetUsermetaparameters): Promise<number | null> => {
  try {
    const obj = { userId, metaKey, metaValue: JSON.stringify(metaValue) }

    const responseDb = await Database.
      from('usermeta').
      select('meta_id').
      where('user_id', userId).
      where('meta_key', metaKey)

    if(!!responseDb[0]) {
      const metaId = parseInt(responseDb[0]?.meta_id)
      const usermeta = await Usermeta.updateOrCreate({ metaId }, obj)
      return usermeta.metaId
    }
  }
  catch(error) {
    return null
  }
  return null
}

export const deleteUsermeta = async ({ userId, metaKey }: GetUsermetaparameters): Promise<true | null> => {
  try {
    await Database.
      from('usermeta').
      where('user_id', userId).
      where('meta_key', metaKey).
      delete()

    return true
  }
  catch(err) {
    return null
  }
  return null
}
