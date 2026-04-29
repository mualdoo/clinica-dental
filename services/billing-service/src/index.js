import 'dotenv/config'
import express from 'express'

import routes from './routes/billing-routes.js'
import { syncDatabase } from './models/index.js'

const app = express()

syncDatabase()

app.use(express.json())

app.use('/', routes)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`billing-service corriendo en puerto ${PORT}`)
})
