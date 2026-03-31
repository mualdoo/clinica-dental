import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import routes from './routes/billing-routes.js';
import { syncDatabase } from './models/index.js';
// import { startconsumers } from './services/rabbit-consumer.js';

const app = express();

syncDatabase();
// startConsumers();

app.use(cors());
app.use(express.json());

app.use('/', routes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`billing-service corriendo en puerto ${PORT}`);
});