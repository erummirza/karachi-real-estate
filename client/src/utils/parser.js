
/**
 * Accurately check if a plot matches a target precinct, sector, or phase filter
 * without substring overlap bugs (e.g. preventing P16 from matching P1 or P6).
 */
export function matchPrecinctOrSector(targetFilter, plotPrecinct, plotLocation = '') {
  if (!targetFilter || targetFilter === 'ALL') return true;
  const normalizeToken = val => {
    if (!val) return '';
    let s = val.toLowerCase().trim().replace(/[\s:-]+/g, '');
    s = s.replace(/^precinct/, 'p');
    s = s.replace(/^sector|^sec/, '');
    s = s.replace(/^phase|^ph/, 'phase');
    return s;
  };
  const targetNorm = normalizeToken(targetFilter);
  const actualPrecinctNorm = normalizeToken(plotPrecinct);
  const actualLocationNorm = normalizeToken(plotLocation);

  // Direct exact matches
  if (targetNorm === actualPrecinctNorm || targetNorm === actualLocationNorm) {
    return true;
  }

  // Handle BTK numeric prefix variations (e.g. target "P16" vs actual "16" or target "16" vs actual "P16")
  if (targetNorm === `p${actualPrecinctNorm}` || actualPrecinctNorm === `p${targetNorm}`) {
    return true;
  }

  // Extract numeric/alphanumeric code from target (e.g. "p16" -> "16", "p10a" -> "10a", "14b" -> "14b")
  const targetCode = targetNorm.replace(/^(p|phase)/, '');
  if (targetCode) {
    const actualPrecinctCode = actualPrecinctNorm.replace(/^(p|phase)/, '');
    if (targetCode === actualPrecinctCode) {
      return true;
    }
  }
  return false;
}

/**
 * Format numeric PKR to human readable string (e.g., 7,500,000 => "75 Lacs", 18,500,000 => "1.85 Cr")
 */
export function formatPkrDisplay(amountInPkr) {
  if (!amountInPkr || isNaN(amountInPkr) || amountInPkr <= 0) return 'Price on Call';
  if (amountInPkr >= 10000000) {
    const crores = amountInPkr / 10000000;
    return `${crores % 1 === 0 ? crores : crores.toFixed(2)} Cr`;
  } else if (amountInPkr >= 100000) {
    const lacs = amountInPkr / 100000;
    return `${lacs % 1 === 0 ? lacs : lacs.toFixed(1)} Lacs`;
  }
  return `PKR ${amountInPkr.toLocaleString()}`;
}

/**
 * Parse price string (e.g. "85 lacs", "1.85 cr", "95L", "8.5 crore") into numeric PKR
 */
export function parsePriceToPkr(text) {
  const clean = text.toLowerCase().trim();

  // Check Crores
  const croreMatch = clean.match(/([\d.]+)\s*(cr|crore|crores)/i);
  if (croreMatch) {
    const val = parseFloat(croreMatch[1]);
    if (!isNaN(val)) {
      const pkr = Math.round(val * 10000000);
      return {
        pkr,
        display: formatPkrDisplay(pkr)
      };
    }
  }

  // Check Lacs / Lakhs / L
  const lacMatch = clean.match(/([\d.]+)\s*(lac|lacs|lakh|lakhs|l)\b/i);
  if (lacMatch) {
    const val = parseFloat(lacMatch[1]);
    if (!isNaN(val)) {
      const pkr = Math.round(val * 100000);
      return {
        pkr,
        display: formatPkrDisplay(pkr)
      };
    }
  }

  // Check raw numbers (e.g. 8500000)
  const numMatch = clean.match(/(\d{6,10})/);
  if (numMatch) {
    const pkr = parseInt(numMatch[1], 10);
    return {
      pkr,
      display: formatPkrDisplay(pkr)
    };
  }
  return {
    pkr: 0,
    display: 'Price on Call'
  };
}

/**
 * Rule-based fallback parser for real estate text lines in Karachi
 */
export function parseInventoryTextClient(rawText) {
  const rawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const results = [];

  // Extract block-level global contact phone if available
  const globalPhoneMatch = rawText.match(/(03\d{2}[- ]?\d{7}|\+92\s*3\d{2}[- ]?\d{7})/);
  const globalPhone = globalPhoneMatch ? globalPhoneMatch[0] : '';
  let currentSociety = 'BTK';
  let currentPrecinctOrSector = 'P1';
  let currentLocation = 'Precinct 1';
  for (const rawLine of rawLines) {
    const lower = rawLine.toLowerCase();

    // Check header hints to update society context
    if (lower.includes('bahria town') || lower.includes('btk') || lower.includes('precinct')) {
      currentSociety = 'BTK';
    } else if (lower.includes('dha city') || lower.includes('dck') || lower.includes('sector')) {
      currentSociety = 'DCK';
    } else if (lower.includes('dha') || lower.includes('phase') || lower.includes('khayaban')) {
      currentSociety = 'DHA';
    }

    // Check if line is purely a section header (e.g. "Available P16", "P16 Available", "BTK Precinct 16", "DCK Sector 3A", "Phase 6")
    const precinctHeaderMatch = rawLine.match(/\b(?:available|inventory|list|plots)?\s*(?:precinct|p)\s*[-:]?\s*(\d+[a-z]?)\b/i) || rawLine.match(/\b(?:precinct|p)\s*[-:]?\s*(\d+[a-z]?)\s*(?:available|inventory|list|plots)?\b/i);
    const sectorHeaderMatch = rawLine.match(/\b(?:sector|sec)\s*[-:]?\s*(\d+[a-z]?)\b/i);
    const phaseHeaderMatch = rawLine.match(/\b(?:phase|ph)\s*[-:]?\s*(\d+[a-z]?)\b/i);

    // If line looks like a section header and contains no individual plot listing descriptors
    const isHeaderLine = (precinctHeaderMatch || sectorHeaderMatch || phaseHeaderMatch) && !/\b(demand|lacs|cr|corner|west open|park|yard|yards|sqyd|allotment|call|03\d{8,10})\b/i.test(rawLine) && !/^\d+[\.\)]\d+/.test(rawLine);
    if (isHeaderLine) {
      if (currentSociety === 'BTK' && precinctHeaderMatch) {
        const pNum = precinctHeaderMatch[1].toUpperCase();
        currentPrecinctOrSector = `P${pNum}`;
        currentLocation = `Precinct ${pNum}`;
      } else if (currentSociety === 'DCK' && sectorHeaderMatch) {
        const sec = sectorHeaderMatch[1].toUpperCase();
        currentPrecinctOrSector = sec;
        currentLocation = `Sector ${sec}`;
      } else if (currentSociety === 'DHA' && phaseHeaderMatch) {
        const ph = phaseHeaderMatch[1].toUpperCase();
        currentPrecinctOrSector = `Phase ${ph}`;
        currentLocation = `DHA Phase ${ph}`;
      }
      continue; // Skip creating a fake plot item for a header line!
    }

    // Clean leading list index numbers like "1.", "2.", "10.", "1)", "(1)" or "1.1898"
    let cleanLine = rawLine.replace(/^\s*\(?\d+\)[\.\s-]?\s*/, '').replace(/^\s*\d+[\.\)]\s*/, '').replace(/^\s*\d+\.(?=\d{2,4}[a-z]?\b)/i, '').trim();
    const cleanLower = cleanLine.toLowerCase();

    // Skip non-plot informational lines (e.g. "All with Allotments", "Demand On Call", "03363754718")
    if (cleanLine.length < 3 || /^(all with|demand on call|demand|contact|call|allotments|available|nil)\b/i.test(cleanLine) || /^(03\d{2}[- ]?\d{7}|\+92\s*3\d{2}[- ]?\d{7})$/.test(cleanLine)) {
      continue;
    }

    // Extract plot number
    let plotNumber = '';
    const explicitPlotMatch = cleanLine.match(/\b(?:plot|#|num|no\.?)\s*[:#-]?\s*(\d+[a-z]?)\b/i);
    const numPrefixMatch = cleanLine.match(/^(\d{1,4}[a-z]?)\b/i);
    const anyPlotMatch = cleanLine.match(/\b(\d{2,4}[a-z]?)\b/i);
    if (explicitPlotMatch) {
      plotNumber = explicitPlotMatch[1].toUpperCase();
    } else if (numPrefixMatch) {
      plotNumber = numPrefixMatch[1].toUpperCase();
    } else if (anyPlotMatch) {
      plotNumber = anyPlotMatch[1].toUpperCase();
    } else {
      continue; // Skip line if no plot number can be identified
    }

    // Determine society and precinct for this specific line, defaulting to context
    let society = currentSociety;
    let precinctOrSector = currentPrecinctOrSector;
    let location = currentLocation;
    const linePMatch = cleanLine.match(/\b(precinct|p)\s*[-:]?\s*(\d+[a-z]?)\b/i);
    const lineSecMatch = cleanLine.match(/\b(sector|sec)\s*[-:]?\s*(\d+[a-z]?)\b/i);
    const linePhMatch = cleanLine.match(/\b(phase|ph)\s*[-:]?\s*(\d+[a-z]?)\b/i);
    if (linePMatch) {
      society = 'BTK';
      const pNum = linePMatch[2].toUpperCase();
      precinctOrSector = `P${pNum}`;
      location = `Precinct ${pNum}`;
    } else if (lineSecMatch) {
      society = 'DCK';
      const sec = lineSecMatch[2].toUpperCase();
      precinctOrSector = sec;
      location = `Sector ${sec}`;
    } else if (linePhMatch) {
      society = 'DHA';
      const ph = linePhMatch[2].toUpperCase();
      precinctOrSector = `Phase ${ph}`;
      location = `DHA Phase ${ph}`;
    }

    // Category
    let category = 'Residential';
    if (cleanLower.includes('commercial') || cleanLower.includes('comm')) {
      category = 'Commercial';
    } else if (cleanLower.includes('villa') || cleanLower.includes('house')) {
      category = 'Villa';
    } else if (cleanLower.includes('apartment') || cleanLower.includes('flat')) {
      category = 'Apartment';
    } else if (cleanLower.includes('file')) {
      category = 'Plot File';
    }

    // Size Sqyd
    let sizeSqyd = 250;
    const sizeMatch = cleanLine.match(/\b(\d{3,4})\s*(sqyd|yd|yards|sq\s*yd|yard)\b/i) || cleanLine.match(/\((\d{3,4})\s*(sqyd|yd|yards|sq\s*yd|yard)?\)/i);
    if (sizeMatch) {
      sizeSqyd = parseInt(sizeMatch[1], 10);
    } else if (cleanLower.includes('125')) sizeSqyd = 125;else if (cleanLower.includes('200')) sizeSqyd = 200;else if (cleanLower.includes('250')) sizeSqyd = 250;else if (cleanLower.includes('350')) sizeSqyd = 350;else if (cleanLower.includes('500')) sizeSqyd = 500;else if (cleanLower.includes('1000') || cleanLower.includes('1 kanal')) sizeSqyd = 1000;else if (cleanLower.includes('2000') || cleanLower.includes('2 kanal')) sizeSqyd = 2000;

    // Price
    const {
      pkr,
      display
    } = parsePriceToPkr(cleanLine);

    // Features
    const features = [];
    if (cleanLower.includes('corner') || cleanLower.includes('semi corner')) features.push('Corner');
    if (cleanLower.includes('west open') || cleanLower.includes('w/o')) features.push('West Open');
    if (cleanLower.includes('main') || cleanLower.includes('boulevard') || cleanLower.includes('mb') || cleanLower.includes('jinnah')) features.push('Main Boulevard');
    if (cleanLower.includes('park') || cleanLower.includes('facing') || cleanLower.includes('pf') || cleanLower.includes('p/f')) features.push('Park Facing');
    if (cleanLower.includes('possession')) features.push('Possession');
    if (cleanLower.includes('belted')) features.push('Belted');
    if (cleanLower.includes('leased')) features.push('Leased');

    // Agent phone
    const linePhoneMatch = cleanLine.match(/(03\d{2}[- ]?\d{7}|\+92\s*3\d{2}[- ]?\d{7})/);
    const agentPhone = linePhoneMatch ? linePhoneMatch[0] : globalPhone || '0300-1234567';

    // Agent name
    let agentName = 'Karachi Real Estate Agent';
    if (cleanLower.includes('call') || cleanLower.includes('contact')) {
      const parts = cleanLine.split(/(?:call|contact|-|:)/i);
      if (parts.length > 1 && parts[parts.length - 1].length < 30) {
        agentName = parts[parts.length - 1].replace(/\d+/g, '').trim() || agentName;
      }
    }
    const societyName = society === 'BTK' ? 'Bahria Town Karachi' : society === 'DCK' ? 'DHA City Karachi' : 'DHA Karachi';
    results.push({
      society,
      societyName,
      location,
      precinctOrSector,
      plotNumber,
      category,
      sizeSqyd,
      sizeDisplay: `${sizeSqyd} Sqyd`,
      demandPricePkr: pkr,
      demandDisplay: display,
      features: features.length > 0 ? features : ['Standard Location'],
      agentName: agentName || 'Prime Estate Agent',
      agentPhone,
      agencyName: 'Karachi Real Estate Network',
      status: 'Available',
      rawText: rawLine,
      createdAt: new Date().toISOString(),
      offers: []
    });
  }
  return results;
}
