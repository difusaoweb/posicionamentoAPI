import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/access', 'AccessController.login')

  Route.group(() => {
    Route.delete('/access', 'AccessController.logout')
  }).middleware('auth')

  Route.put('/access/resetpassword', 'AccessController.resetpassword')

  Route.put('/access/changepassword', 'AccessController.changepassword')
}).prefix('/v1')
