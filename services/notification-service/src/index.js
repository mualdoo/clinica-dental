import 'dotenv/config';
import express from 'express';

import startConsumers from './rabbitmq/consumer.js';

const app = express();

// startConsumers();

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
    console.log(`notification-service running on port: ${PORT}`);
});