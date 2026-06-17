import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../config/.env'), override: true });

import express from 'express';
import cors from 'cors';
const { default: dentistaRoutes } = await import('./dentista.routes.js');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/dentistas', dentistaRoutes);

const PORTA = process.env.PORTA || 3001;

app.listen(PORTA, () => {
    console.log(`Servidor de dentistas rodando em http://localhost:${PORTA}`);
});

export default app;
