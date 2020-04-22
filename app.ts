import Express from 'express'
import typeRouter from './routes/type'
import resourceRouter from './routes/resource'
import config from './config'

let PORT = config.PORT
const app = Express()

app.all('*', (req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': '*'
  })
  next()
})
app.use('/type', typeRouter)
app.use('/resource', resourceRouter)



app.on('error', () => {
  console.error('listen to port: ' + PORT + 'fail');
})
app.listen(PORT, listenSuccess)

function listenSuccess() {
  console.log('start server success, listen on port: ' + PORT)
}