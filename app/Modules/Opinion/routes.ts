import Route from '@ioc:Adonis/Core/Route'


Route.group(() => {

  // Get all Opinions
  Route.get('/opinions', 'OpinionsController.index')

  // Get single Opinion
  Route.get('/opinions/:id?', 'OpinionsController.show').where('id', {
    match: /^[0-9]+$/,
    cast: (id) => Number(id)
  })

  // Get all Opinions from Author
  Route.get('/opinions/author/:id?', 'OpinionsController.author').where('id', {
    match: /^[0-9]+$/,
    cast: (id) => Number(id)
  })

  // Get all Opinions from Affirmation
  Route.get('/opinions/affirmation/:id?', 'OpinionsController.affirmation').where('id', {
    match: /^[0-9]+$/,
    cast: (id) => Number(id)
  })

  Route.group(() => {
    // Create opinion
    Route.post('/opinions', 'OpinionsController.store')

    // // Remove opinion
    // Route.delete('/opinions/:id?', 'OpinionsController.destroy').where('id', {
    //   match: /^[0-9]+$/,
    //   cast: (id) => Number(id),
    // })
  }).middleware('auth')
}).prefix('/v1')
