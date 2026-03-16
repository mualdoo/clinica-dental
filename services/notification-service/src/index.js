require('dotenv').config();
const express = require('express');

const { startConsumers } = require('./rabbitmq/consumer');

const app = express();

startConsumers();

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
    console.log(`notification-service running on port: ${PORT}`);
});