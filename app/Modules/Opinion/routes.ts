import Route from '@ioc:Adonis/Core/Route'


Route.group(() => {

  // Get all Opinions
  Route.get('/opinions', 'OpinionsController.index')

  // Get single Opinion
  Route.get('/opinions/:id?', 'OpinionsController.show').where('id', {
    match: /^[0-9]+$/,
    cast: (id) => Number(id)
  })

  // Get all Opinions from user
  Route.get('/opinions/user', 'OpinionsController.user')

  // Get all Opinions from Affirmation
  Route.get('/opinions/affirmation', 'OpinionsController.affirmation')

  Route.group(() => {
    // Create opinion
    Route.get('/opinions/create', 'OpinionsController.addOrUpdate')

    // // Remove opinion
    // Route.delete('/opinions/:id?', 'OpinionsController.destroy').where('id', {
    //   match: /^[0-9]+$/,
    //   cast: (id) => Number(id),
    // })
  }).middleware('auth')
}).prefix('/v1')
