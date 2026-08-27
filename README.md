# Karachi Real Estate Plot Inventory & Bidding Platform (MERN)

A tool for Karachi real estate agents to manage plot inventory and offers
across Bahria Town Karachi, DHA City Karachi, and DHA Karachi. Built as a
MERN app (MongoDB, Express, React, Node) — plain JavaScript, no TypeScript.

```
RealEstate/
├── client/     React + Vite frontend
├── server/     Express + MongoDB backend
└── package.json  root scripts to run both
```

## Prerequisites

- Node.js 18+
- A MongoDB instance — either running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- (Optional) A [Gemini API key](https://ai.google.dev/) for AI-powered inventory parsing. Without one, the app automatically falls back to its built-in rule-based parser.

## Setup

1. **Install dependencies** (installs both `client` and `server`):
   ```bash
   npm run install:all
   ```

2. **Configure environment variables.** Copy the example env file and fill it in:
   ```bash
   cp server/.env.example server/.env
   ```
   Edit `server/.env`:
   ```
   MONGODB_URI="mongodb://localhost:27017/karachi_real_estate"
   GEMINI_API_KEY="your-gemini-api-key"   # optional
   PORT=5000
   ```

3. **Seed the database** (one-time, populates starting inventory):
   ```bash
   npm run seed
   ```

4. **Run the app** (starts both client and server together):
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - The Vite dev server proxies `/api/*` requests to the Express server, so the frontend just calls relative paths like `/api/plots`.

## Running client/server separately

```bash
npm run dev:server   # Express API on :5000
npm run dev:client   # Vite dev server on :3000
```

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/plots` | Get all plots |
| `POST` | `/api/plots/import` | Insert newly parsed plots |
| `POST` | `/api/plots/:plotId/offers` | Add an offer to a plot |
| `PATCH` | `/api/plots/:plotId/offers/:offerId` | Update an offer's status |
| `POST` | `/api/parse-inventory` | Parse raw pasted text into structured plots (Gemini, with rule-based fallback) |

## Notes

- All data is stored in MongoDB — no more browser `localStorage`.
- This is a single shared inventory with no authentication yet; that's a
  planned future phase, along with real-time sync across open clients.
