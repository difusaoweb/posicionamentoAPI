import Route from '@ioc:Adonis/Core/Route'


Route.group(() => {

  // Get all Opinions
  Route.get('/opinions', 'OpinionsController.index')

  // Get single Opinion
  Route.get('/opinions/:id?', 'OpinionsController.show').where('id', {
    match: /^[0-9]+$/,
    cast: (id) => Number(id)
  })

  Route.group(() => {
    // // Remove opinion
    // Route.delete('/opinions/:id?', 'OpinionsController.destroy').where('id', {
    //   match: /^[0-9]+$/,
    //   cast: (id) => Number(id),
    // })


    // Post or put opinion from affirmation
    Route.get('/opinions/create', 'OpinionsController.addOrUpdate')
  }).middleware('auth')

  // Get opinions from user
  Route.get('/opinions/user', 'OpinionsController.user')

  // Get opinions from affirmation
  Route.get('/opinions/affirmation', 'OpinionsController.affirmation')
}).prefix('/v1')
