import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import afiliadoRoutes from './routes/afiliado';
import grupoRoutes from './routes/grupo';
import liquidacionRoutes from './routes/liquidacion';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/afiliados', afiliadoRoutes);
app.use('/api/grupos', grupoRoutes);
app.use('/api/liquidaciones', liquidacionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { prisma };
