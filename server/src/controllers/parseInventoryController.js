import { parseInventoryText } from '../services/geminiParser.js';

/** POST /api/parse-inventory */
export async function parseInventory(req, res) {
  const rawText = req.body?.text || '';

  if (!rawText.trim()) {
    return res.status(400).json({ error: 'No text provided' });
  }

  const result = await parseInventoryText(rawText);
  res.json(result);
}
