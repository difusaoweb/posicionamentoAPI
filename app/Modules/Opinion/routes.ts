import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    // Get all opinions
    Route.get('/opinions', 'OpinionsController.index')

    // Create opinion
    Route.post('/opinions', 'OpinionsController.store')

    // Get single opinion
    Route.get('/opinions/:id?', 'OpinionsController.show').where('id', {
      match: /^[0-9]+$/,
      cast: (id) => Number(id),
    })

    // Remove opinion
    Route.delete('/opinions/:id?', 'OpinionsController.destroy').where('id', {
      match: /^[0-9]+$/,
      cast: (id) => Number(id),
    })
  }).middleware('auth')
}).prefix('/v1')
