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
    // // Remove affirmation
    // Route.delete('/affirmations/:id?', 'AffirmationsController.destroy').where('id', {
    //   match: /^[0-9]+$/,
    //   cast: (id) => Number(id),
    // })


    // Post affirmation
    Route.get('/affirmations/create', 'AffirmationsController.create')
  }).middleware('auth')

  // Get affirmations from Home
  Route.get('/affirmations/home', 'AffirmationsController.home')

  // Get affirmations from Trending
  Route.get('/affirmations/trending', 'AffirmationsController.trending')

  // Get affirmations from Search
  Route.get('/affirmations/search', 'AffirmationsController.search')

  // Get single affirmation
  Route.get('/affirmations/affirmation', 'AffirmationsController.affirmation')
}).prefix('/v1')
