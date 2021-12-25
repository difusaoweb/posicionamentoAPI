import Route from '@ioc:Adonis/Core/Route'



Route.group(() => {

  Route.get('/affirmations', 'AffirmationsController.index')

//   Route.group(() => {
//     // Get all affirmations
//     Route.get('/affirmations', 'AffirmationsController.index')

//     // Create affirmation
//     Route.post('/affirmations', 'AffirmationsController.store')

//     // Get single affirmation
//     Route.get('/affirmations/:id?', 'AffirmationsController.show').where('id', {
//       match: /^[0-9]+$/,
//       cast: (id) => Number(id),
//     })

//     // Remove affirmation
//     Route.delete('/affirmations/:id?', 'AffirmationsController.destroy').where('id', {
//       match: /^[0-9]+$/,
//       cast: (id) => Number(id),
//     })
//   }).middleware('auth')
}).prefix('/v1')
