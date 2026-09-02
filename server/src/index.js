import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import plotsRouter from './routes/plots.js';
import parseInventoryRouter from './routes/parseInventory.js';
import agentsRouter from './routes/agents.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/plots', plotsRouter);
app.use('/api/parse-inventory', parseInventoryRouter);
app.use('/api/agents', agentsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
