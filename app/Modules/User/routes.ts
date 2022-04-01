import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {

  // Create user
  Route.get('/users/create', 'UsersController.create')


  // Get all users
  Route.get('/users', 'UsersController.index')

  // Get single user
  Route.get('/users/:id?', 'UsersController.show').where('id', {
    match: /^[0-9]+$/,
    cast: (id) => Number(id),
  })

  // Get user profile
  Route.get('/users/profile', 'UsersController.profile')

  Route.group(() => {
    // Update user
    Route.put('/users/:id?', 'UsersController.update').where('id', {
      match: /^[0-9]+$/,
      cast: (id) => Number(id),
    })

    // Remove user
    Route.delete('/users/:id?', 'UsersController.destroy').where('id', {
      match: /^[0-9]+$/,
      cast: (id) => Number(id),
    })
  }).middleware('auth')
}).prefix('/v1')
