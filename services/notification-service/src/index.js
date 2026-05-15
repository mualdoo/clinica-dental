import 'dotenv/config'
import express from 'express'

import routes from './routes/notification-routes.js'
import startConsumers from './rabbitmq/consumer.js'

const app = express()

startConsumers()

app.use(express.json())

app.use('/', routes)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`notification-service running on port: ${PORT}`)
})
