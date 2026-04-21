import 'dotenv/config'
import express from 'express'

import routes from './routes/user-routes.js'
import { syncDatabase } from './models/index.js'
import createDefaultAdmin from './lib/setup-admin.js'
import startConsumers from './services/rabbit-consumer.js'

const app = express()

syncDatabase().then(() => {
    createDefaultAdmin()
})
startConsumers()

app.use(express.json())

app.use('/', routes)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`auth-service corriendo en puerto ${PORT}`)
})
