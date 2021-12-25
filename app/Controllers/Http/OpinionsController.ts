import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

import Opinion from 'App/Models/Opinion'
import User from 'App/Models/User'

export default class OpinionsController {
  public async index() {
    const all = await Opinion.all()

    return all
  }
}
