import 'dotenv/config';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

// import authenticateToken from './middleware/auth-middleware.js';
// import authorizeRole from './middleware/role-middleware.js';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.get('/', (req, res) => {
    res.json({ message: "API Gateway funcionando" });
});

// app.use(
//     '/paciente',
//     verificarToken,
//     autorizarRoles('admin', 'dentista'),
//     createProxyMiddleware({
//         target: 'http://paciente-service:8080',
//         changeOrigin: true
//     })
// );

app.use('/auth', createProxyMiddleware({ // Borrar
    target: 'http://auth-service:3001',
    changeOrigin: true
}));

app.use('/agenda', createProxyMiddleware({ // Borrar
    target: 'http://agenda-service:3002',
    changeOrigin: true
}));

app.use('/patient', createProxyMiddleware({ // Borrar
    target: 'http://patient-service:3003',
    changeOrigin: true
}));

app.use('/billing', createProxyMiddleware({ // Borrar
    target: 'http://billing-service:3004',
    changeOrigin: true
}));
// INSERT_NEW_SERVICE_HERE

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`API Gateway corriendo en puerto ${PORT}`);
});