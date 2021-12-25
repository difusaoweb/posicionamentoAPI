import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

import Affirmation from 'App/Models/Affirmation'
import User from 'App/Models/User'

export default class AffirmationsController {
  public async index() {
    const all = await Affirmation.all()

    return all
  }
}
