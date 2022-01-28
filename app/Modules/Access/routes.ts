import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/access', 'AccessController.login')

  Route.group(() => {

    Route.get('/access/authenticated', 'AccessController.checkAuthenticated')

    Route.get('/access/delete', 'AccessController.logout')
  }).middleware('auth')

  // Route.put('/access/resetpassword', 'AccessController.resetpassword')

  // Route.put('/access/changepassword', 'AccessController.changepassword')
}).prefix('/v1')
