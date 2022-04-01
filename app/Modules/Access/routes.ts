import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/access', 'AccessController.login')

  Route.get('/access/authenticated', 'AccessController.checkAuthenticated')

  Route.group(() => {
    Route.get('/access/delete', 'AccessController.logout')
  }).middleware('auth')

  Route.get('/access/reset-password', 'AccessController.resetPassword')

  Route.get('/access/change-password', 'AccessController.changePassword')
}).prefix('/v1')
