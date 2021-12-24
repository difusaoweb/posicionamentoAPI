import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    // Get all obrigados
    Route.get('/obrigados', 'ObrigadosController.index')

    // Create obrigado
    Route.post('/obrigados', 'ObrigadosController.store')

    // Get single obrigado
    Route.get('/obrigados/:id?', 'ObrigadosController.show').where('id', {
      match: /^[0-9]+$/,
      cast: (id) => Number(id),
    })

    // Remove obrigado
    Route.delete('/obrigados/:id?', 'ObrigadosController.destroy').where('id', {
      match: /^[0-9]+$/,
      cast: (id) => Number(id),
    })
  }).middleware('auth')
}).prefix('/v1')
