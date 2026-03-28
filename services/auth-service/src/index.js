import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import routes from './routes/user-routes.js';
import { syncDatabase } from './models/index.js';
import startConsumers from './services/rabbit-consumer.js';

const app = express();

syncDatabase();
startConsumers();

app.use(cors());
app.use(express.json());

app.use('/', routes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`auth-service corriendo en puerto ${PORT}`);
});