import 'dotenv/config'
import express from 'express'

import routes from './routes/inventory-routes.js'
import { syncDatabase } from './models/index.js'

const app = express()

syncDatabase()

app.use(express.json())

app.use('/', routes)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`inventory-service corriendo en puerto ${PORT}`)
})
