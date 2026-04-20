import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import routes from './routes/agenda-routes.js'
import { syncDatabase } from './models/index.js'

const app = express()

syncDatabase()

app.use(cors())
app.use(express.json())

app.use('/', routes)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`agenda-service corriendo en puerto ${PORT}`)
})
