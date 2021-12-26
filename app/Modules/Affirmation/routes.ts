import Route from '@ioc:Adonis/Core/Route'


Route.group(() => {

  // Get all Affirmations
  Route.get('/affirmations', 'AffirmationsController.index')

  // Get single Affirmation
  Route.get('/affirmations/:id?', 'AffirmationsController.show').where('id', {
    match: /^[0-9]+$/,
    cast: (id) => Number(id),
  })

  Route.group(() => {
    // Create affirmation
    Route.post('/affirmations', 'AffirmationsController.store')

    // // Remove affirmation
    // Route.delete('/affirmations/:id?', 'AffirmationsController.destroy').where('id', {
    //   match: /^[0-9]+$/,
    //   cast: (id) => Number(id),
    // })
  }).middleware('auth')
}).prefix('/v1')
