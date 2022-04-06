import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/access', 'AccessController.login')

  Route.get('/access/authenticated', 'AccessController.checkAuthenticated')

  Route.group(() => {
    Route.get('/access/delete', 'AccessController.logout')
  }).middleware('auth')


  Route.group(() => {
    Route.get('', 'AccessController.resetPassword')

    Route.get('/verify-code', 'AccessController.resetPasswordVerifyCode')

    Route.get('/change-password', 'AccessController.resetPasswordChangePassword')
  }).prefix('/access/reset-password')
}).prefix('/v1')
