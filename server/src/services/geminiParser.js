import { GoogleGenAI } from '@google/genai';

const PROMPT_TEMPLATE = (rawText) => `You are an expert Pakistani real estate inventory parser. Extract real estate plot listings from the following pasted text string into a JSON array of objects.
Target housing societies in Karachi:
1. Bahria Town Karachi (BTK) - Precincts P1 to P63 (e.g. Precinct 1, Precinct 10A, P16, P19, P31, P63)
2. DHA City Karachi (DCK) - Sectors 1A to 14B (e.g. Sector 1A, Sector 3A, Sector 14B)
3. DHA Karachi (DHA) - Phase 1 to Phase 8 / Phase 8 Extension (e.g. Phase 2, Phase 6, Phase 8)

IMPORTANT PARSING RULES:
- The text often contains block headers (e.g., "Available P16", "P16 Available", "BTK Precinct 10A", "Sector 3A") followed by a numbered or bulleted list of plots (e.g. "1.1898 Entrance Corner (400 yards)", "2.1774 Corner", "3.20 Jinnah Back").
- Do NOT output section header lines as plot objects.
- All plot items listed under a section header MUST inherit that section header's precinct/sector/phase (e.g., "P16" for all items under "Available P16").
- Clean list prefixes (like "1.", "2.", "10.") so that plot numbers like "1898", "1774", "20", "80", "1547a", "2206", "2246", "181", "2205s", "2270s", "2390" are extracted accurately.
- If contact numbers or demand prices (e.g., "03363754718", "Demand On Call") appear at the bottom or top of a block, apply that contact phone and price to all plot items in that block.

For each listing found in the text, extract:
- "society": "BTK" | "DCK" | "DHA"
- "location": Full location string (e.g. "Precinct 16", "Precinct 10A", "Sector 3A", "DHA Phase 6")
- "precinctOrSector": Normalized precinct/sector string (e.g. "P16", "P10A", "3A", "Phase 6")
- "plotNumber": plot string (e.g. "1898", "1774", "20", "80", "1547A", "2206", "2246", "181", "2205S", "2270S", "2390")
- "category": "Residential" | "Commercial" | "Villa" | "Apartment" | "Plot File"
- "sizeSqyd": number in square yards (e.g., 125, 200, 250, 364, 400, 500, 1000)
- "demandPricePkr": total price in numeric Pakistani Rupees (e.g. 0 if "Demand On Call", or 7500000 for 75 Lacs)
- "demandDisplay": formatted price string (e.g. "Price on Call", "75 Lacs", "1.85 Cr")
- "features": array of strings (e.g., ["Corner", "West Open", "Main Boulevard", "Park Facing", "Possession"])
- "agentName": extracted agent or agency name if present, or "Real Estate Agent"
- "agentPhone": extracted Pakistani mobile number (e.g., "03363754718")
- "notes": extra location/plot notes (e.g. "Entrance Corner", "Jinnah Back", "Nursery St Plot", "Semi corner pf Nursery")

Raw text:
"""
${rawText}
"""

Return JSON format with key "items" containing array of parsed plot objects.`;

/**
 * Parse raw pasted inventory text into structured plot items using Gemini.
 * Falls back gracefully (useFallback: true) if no API key is configured or
 * the Gemini call fails, so the client can use its rule-based parser instead.
 */
export async function parseInventoryText(rawText) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return {
      useFallback: true,
      message: 'Gemini API key not configured, using rule parser',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: PROMPT_TEMPLATE(rawText),
      config: {
        responseMimeType: 'application/json',
      },
    });

    const textOutput = response.text || '{}';
    const resultObj = JSON.parse(textOutput);

    return {
      useFallback: false,
      items: resultObj.items || [],
    };
  } catch (err) {
    console.error('Gemini parse error:', err);
    return {
      useFallback: true,
      error: err?.message,
    };
  }
}
