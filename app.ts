import Express from 'express'
import typeRouter from './routes/type'
import resourceRouter from './routes/resource'
import config from './config'

let PORT = config.PORT
const app = Express()

app.use('/type', typeRouter)
app.use('/resource', resourceRouter)

app.on('error', () => {
  PORT += 1
  app.listen(PORT, listenSuccess)
})
app.listen(PORT, listenSuccess)

function listenSuccess() {
  console.log('start server success, listen on port: ' + PORT)
}