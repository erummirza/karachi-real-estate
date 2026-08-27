import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Plot } from './models/Plot.js';
import { INITIAL_PLOTS } from './data/mockPlots.js';
import mongoose from 'mongoose';

dotenv.config();

async function seed() {
  await connectDB();

  const existingCount = await Plot.countDocuments();
  if (existingCount > 0) {
    console.log(`Skipping seed: ${existingCount} plot(s) already exist.`);
    await mongoose.disconnect();
    return;
  }

  await Plot.insertMany(INITIAL_PLOTS);
  console.log(`Seeded ${INITIAL_PLOTS.length} plots.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
