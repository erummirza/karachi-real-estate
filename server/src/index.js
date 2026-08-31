import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import plotsRouter from './routes/plots.js';
import parseInventoryRouter from './routes/parseInventory.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/plots', plotsRouter);
app.use('/api/parse-inventory', parseInventoryRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB once, reused across serverless invocations
let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  next();
});

// Only run a local server when NOT on Vercel
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;