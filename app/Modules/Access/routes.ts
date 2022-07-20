import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.get('/login', 'AccessController.login')

    Route.get('/authenticated', 'AccessController.checkAuthenticated')

    Route.group(() => {
      Route.get('/verify-code-email', 'AccessController.verifyCodeEmail')
      Route.get('/delete', 'AccessController.logout')
    }).middleware('auth')


    Route.group(() => {
      Route.get('/', 'AccessController.resetPassword')
      Route.get('/change-password', 'AccessController.resetPasswordChangePassword')
    }).prefix('/reset-password')
  }).prefix('/access')
}).prefix('/v1')
