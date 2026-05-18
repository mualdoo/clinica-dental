import 'dotenv/config'
import app from './app.js'

// Mapeo del puerto, ideal si usas docker-compose
const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Storage Service ejecutándose en puerto ${PORT}`)
})
