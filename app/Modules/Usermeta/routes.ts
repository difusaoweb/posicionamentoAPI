import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {

    // Get usermeta
    Route.get('/usermeta', 'UsermetaController.getUsermetaM')

    // Create usermeta
    Route.post('/usermeta', 'UsermetaController.addUsermetaM')

    // Update usermeta
    Route.put('/usermeta', 'UsermetaController.updateUsermetaM')

    // Remove usermeta
    Route.delete('/usermeta', 'UsermetaController.deleteUsermetaM')

  }).middleware('auth')
}).prefix('/v1')
