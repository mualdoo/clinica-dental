require('dotenv').config();
const express = require('express');
const cors = require('cors');

const routes = require('./routes/patient-routes');
const { syncDatabase } = require('./models')

const app = express();

syncDatabase();

app.use(cors());
app.use(express.json());

app.use('/', routes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`auth-service corriendo en puerto ${PORT}`);
});