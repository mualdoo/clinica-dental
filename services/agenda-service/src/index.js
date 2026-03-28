require('dotenv').config();
const express = require('express');
const cors = require('cors');

const routes = require('./routes/agenda-routes');
const { syncDatabase } = require('./models');
// const { startConsumers } = require('./services/rabbit-consumer');

const app = express();

syncDatabase();
// startConsumers();

app.use(cors());
app.use(express.json());

app.use('/', routes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`agenda-service corriendo en puerto ${PORT}`);
});