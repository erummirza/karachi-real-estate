
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
  const clean = text
    .toLowerCase()
    .trim();

  // ------------------------------------------------------------
  // Crores
  // 1.55 cr
  // 1.55 crore
  // 2 crores
  // ------------------------------------------------------------
  const croreMatch = clean.match(
    /([\d.]+)\s*(cr|crore|crores)\b/i
  );

  if (croreMatch) {
    const val = parseFloat(croreMatch[1]);

    if (!isNaN(val)) {
      const pkr = Math.round(
        val * 10000000
      );

      return {
        pkr,
        display: formatPkrDisplay(pkr)
      };
    }
  }

  // ------------------------------------------------------------
  // Lacs / Lakhs
  // 21 lac
  // 21 lacs
  // 27 lakh
  // 95L
  // ------------------------------------------------------------
  const lacMatch = clean.match(
    /([\d.]+)\s*(lac|lacs|lakh|lakhs|l)\b/i
  );

  if (lacMatch) {
    const val = parseFloat(lacMatch[1]);

    if (!isNaN(val)) {
      const pkr = Math.round(
        val * 100000
      );

      return {
        pkr,
        display: formatPkrDisplay(pkr)
      };
    }
  }

  // ------------------------------------------------------------
  // Raw PKR
  // 8500000
  // 15500000
  // ------------------------------------------------------------
  const numMatch = clean.match(
    /\b(\d{6,10})\b/
  );

  if (numMatch) {
    const pkr = parseInt(
      numMatch[1],
      10
    );

    return {
      pkr,
      display: formatPkrDisplay(pkr)
    };
  }

  // ------------------------------------------------------------
  // OPTIONAL:
  // If your inventory convention is that a standalone decimal
  // such as "1.55" means crore, enable this.
  //
  // Example:
  // "P4 Road 4-A Allotment 512sq 230s 1.55"
  //                    => 1.55 Cr
  // ------------------------------------------------------------
  const standaloneDecimal = clean.match(
    /(?:^|\s)(\d+\.\d{1,2})(?:\s|$)/
  );

  if (standaloneDecimal) {
    const val = parseFloat(
      standaloneDecimal[1]
    );

    if (
      !isNaN(val) &&
      val >= 0.1 &&
      val <= 100
    ) {
      const pkr = Math.round(
        val * 10000000
      );

      return {
        pkr,
        display: formatPkrDisplay(pkr)
      };
    }
  }

  return {
    pkr: 0,
    display: 'Price on Call'
  };
}

/**
 * Rule-based fallback parser for real estate text lines in Karachi
 */
/**
 * Rule-based fallback parser for real estate text lines in Karachi
 *
 * Supports:
 * - Bahria Town Karachi / BTK
 * - P1 ... P63
 * - Alphanumeric precincts such as P15A
 * - DHA City Karachi / DCK sectors
 * - DHA Karachi phases
 * - Plot numbers such as 240S, 1470S, 230S, 160S
 * - Road numbers without confusing them with plot numbers
 * - Commercial / file listings without a plot number
 */
export function parseInventoryTextClient(rawText) {
  const rawLines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const results = [];

  // ------------------------------------------------------------
  // Global contact phone
  // ------------------------------------------------------------
  const globalPhoneMatch = rawText.match(
    /(03\d{2}[- ]?\d{7}|\+92\s*3\d{2}[- ]?\d{7})/
  );

  const globalPhone = globalPhoneMatch
    ? globalPhoneMatch[0]
    : '';

  // ------------------------------------------------------------
  // Current context
  // ------------------------------------------------------------
  let currentSociety = 'BTK';
  let currentPrecinctOrSector = 'P1';
  let currentLocation = 'Precinct 1';

  // ------------------------------------------------------------
  // Helper: normalize precinct
  // P15a -> P15A
  // 15a  -> P15A
  // ------------------------------------------------------------
  const normalizeBtkPrecinct = value => {
    if (!value) return '';

    const clean = String(value)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '');

    const match = clean.match(/^P?(\d+[A-Z]?)$/);

    if (match) {
      return `P${match[1]}`;
    }

    return clean;
  };

  // ------------------------------------------------------------
  // Helper: extract BTK precinct
  //
  // Handles:
  // P23
  // P15a
  // p31
  // Precinct 16
  // Precinct P16
  // ------------------------------------------------------------
  const extractBtkPrecinct = line => {
    if (!line) return null;

    let match = line.match(
      /\bprecinct\s*[-:]?\s*p?(\d+[a-z]?)\b/i
    );

    if (match) {
      return normalizeBtkPrecinct(match[1]);
    }

    // IMPORTANT:
    // P15a must be recognized even though there is no space
    // between P and 15a.
    match = line.match(
      /(?:^|[\s,;(])p\s*[-:]?\s*(\d+[a-z]?)(?=$|[\s,;:.)-])/i
    );

    if (match) {
      return normalizeBtkPrecinct(match[1]);
    }

    return null;
  };

  // ------------------------------------------------------------
  // Helper: extract DCK sector
  // ------------------------------------------------------------
  const extractSector = line => {
    if (!line) return null;

    const match = line.match(
      /\b(?:sector|sec)\s*[-:]?\s*(\d+[a-z]?)\b/i
    );

    return match ? match[1].toUpperCase() : null;
  };

  // ------------------------------------------------------------
  // Helper: extract DHA phase
  // ------------------------------------------------------------
  const extractPhase = line => {
    if (!line) return null;

    const match = line.match(
      /\b(?:phase|ph)\s*[-:]?\s*(\d+[a-z]?)\b/i
    );

    return match ? match[1].toUpperCase() : null;
  };

  // ------------------------------------------------------------
  // Helper: detect road text
  // Road 03
  // Road 4-A
  // Road 12
  // ------------------------------------------------------------
  const roadMatchFromLine = line => {
    if (!line) return '';

    const match = line.match(
      /\broad\s*[-:]?\s*([0-9]+[a-z]?)(?:\s*[-]?\s*([a-z]))?\b/i
    );

    if (!match) return '';

    return match[2]
      ? `${match[1]}-${match[2]}`.toUpperCase()
      : match[1].toUpperCase();
  };

  // ------------------------------------------------------------
  // Helper: identify plot number
  //
  // Priority:
  //
  // 1. Explicit:
  //    Plot 240
  //    Plot #240
  //
  // 2. Plot-like values ending with S:
  //    240s
  //    1470s
  //    230s
  //    160s
  //
  // 3. Standalone numeric plot value
  //
  // IMPORTANT:
  // We intentionally avoid taking:
  // - P15a
  // - Road 03
  // - Road 12
  // - prices
  // as the plot number.
  // ------------------------------------------------------------
  const extractPlotNumber = (line, society) => {
    if (!line) return '';

    // ----------------------------------------------------------
    // Explicit "Plot 240", "Plot #240", "Plot No 240"
    // ----------------------------------------------------------
    const explicitPlotMatch = line.match(
      /\b(?:plot|plot\s*#|plot\s*no\.?|plot\s*num(?:ber)?)\s*[:#-]?\s*(\d+[a-z]?)\b/i
    );

    if (explicitPlotMatch) {
      return explicitPlotMatch[1].toUpperCase();
    }

    // ----------------------------------------------------------
    // Plot suffix "S"
    //
    // Examples:
    // 240s
    // 1470s
    // 230s
    // 160s
    //
    // This is especially important for your inventory format.
    // ----------------------------------------------------------
    const plotSuffixCandidates = [];

    const suffixRegex = /\b(\d{1,4})\s*s\b/gi;

    let match;

    while ((match = suffixRegex.exec(line)) !== null) {
      const value = match[1];

      // Ignore obvious road values if immediately preceded by Road.
      const before = line.substring(
        Math.max(0, match.index - 10),
        match.index
      );

      if (/\broad\s*$/i.test(before)) {
        continue;
      }

      plotSuffixCandidates.push(value);
    }

    if (plotSuffixCandidates.length > 0) {
      return `${plotSuffixCandidates[0]}S`.toUpperCase();
    }

    // ----------------------------------------------------------
    // Remove precinct tokens before searching numeric values.
    //
    // Example:
    // P15a Road 03 1470s
    //
    // P15a should NOT become the plot.
    // ----------------------------------------------------------
    let searchLine = line
      .replace(
        /\bprecinct\s*[-:]?\s*p?\d+[a-z]?\b/gi,
        ' '
      )
      .replace(
        /(?:^|[\s,;(])p\s*[-:]?\s*\d+[a-z]?(?=$|[\s,;:.)-])/gi,
        ' '
      );

    // ----------------------------------------------------------
    // Remove road tokens.
    //
    // Example:
    // Road 03 1470s
    //
    // 03 should NOT become plot number.
    // ----------------------------------------------------------
    searchLine = searchLine.replace(
      /\broad\s*[-:]?\s*\d+[a-z]?(?:\s*[-]?\s*[a-z])?\b/gi,
      ' '
    );

    // ----------------------------------------------------------
    // Remove common price expressions before looking for
    // numeric plot values.
    // ----------------------------------------------------------
    searchLine = searchLine.replace(
      /\b\d+(?:\.\d+)?\s*(?:lac|lacs|lakh|lakhs|cr|crore|crores|million|m)\b/gi,
      ' '
    );

    // ----------------------------------------------------------
    // Look for an explicit standalone numeric value.
    // ----------------------------------------------------------
    const numericCandidates = [];

    const numberRegex = /\b(\d{1,4}[a-z]?)\b/gi;

    while ((match = numberRegex.exec(searchLine)) !== null) {
      const value = match[1].toUpperCase();

      // Ignore very short road-like values that survived cleanup.
      if (/^\d{1,2}$/.test(value)) {
        const before = searchLine.substring(
          Math.max(0, match.index - 10),
          match.index
        );

        if (/\broad\s*$/i.test(before)) {
          continue;
        }
      }

      // Ignore common size values when there is a more
      // plot-like candidate available.
      numericCandidates.push(value);
    }

    // Prefer 3-4 digit numbers for plot numbers.
    const largerCandidate = numericCandidates.find(
      value => /^\d{3,4}[A-Z]?$/.test(value)
    );

    if (largerCandidate) {
      return largerCandidate;
    }

    // Fall back to first numeric candidate.
    if (numericCandidates.length > 0) {
      return numericCandidates[0];
    }

    // ----------------------------------------------------------
    // IMPORTANT:
    // A commercial/file listing can legitimately have no plot.
    // Do NOT discard it here.
    // ----------------------------------------------------------
    return '';
  };

  // ------------------------------------------------------------
  // Process every line
  // ------------------------------------------------------------
  for (const rawLine of rawLines) {
    const lower = rawLine.toLowerCase();

    // ----------------------------------------------------------
    // Society context
    // ----------------------------------------------------------
    if (
      lower.includes('bahria town') ||
      lower.includes('btk') ||
      lower.includes('bahria') ||
      /\bp\d+[a-z]?\b/i.test(rawLine)
    ) {
      currentSociety = 'BTK';
    } else if (
      lower.includes('dha city') ||
      lower.includes('dck') ||
      /\bsector\b/i.test(rawLine)
    ) {
      currentSociety = 'DCK';
    } else if (
      lower.includes('dha') ||
      /\bphase\b/i.test(rawLine) ||
      lower.includes('khayaban')
    ) {
      currentSociety = 'DHA';
    }

    // ----------------------------------------------------------
    // Check for section/header context
    // ----------------------------------------------------------
    const btkPrecinct = extractBtkPrecinct(rawLine);
    const sector = extractSector(rawLine);
    const phase = extractPhase(rawLine);

    const hasListingDescriptor =
      /\b(demand|lac|lacs|lakh|lakhs|cr|crore|crores|corner|west\s*open|park|yard|yards|sqyd|sq\s*yd|allotment|file|commercial|villa|house|call|paid|non\s*paid|offer|cancel)\b/i.test(
        rawLine
      );

    const isPhoneOnly =
      /^(03\d{2}[- ]?\d{7}|\+92\s*3\d{2}[- ]?\d{7})$/.test(
        rawLine
      );

    const looksLikeHeader =
      !hasListingDescriptor &&
      !isPhoneOnly &&
      (
        btkPrecinct ||
        sector ||
        phase
      );

    if (looksLikeHeader) {
      if (currentSociety === 'BTK' && btkPrecinct) {
        currentPrecinctOrSector = btkPrecinct;
        currentLocation = `Precinct ${btkPrecinct.replace(/^P/, '')}`;
      } else if (currentSociety === 'DCK' && sector) {
        currentPrecinctOrSector = sector;
        currentLocation = `Sector ${sector}`;
      } else if (currentSociety === 'DHA' && phase) {
        currentPrecinctOrSector = `Phase ${phase}`;
        currentLocation = `DHA Phase ${phase}`;
      }

      continue;
    }

    // ----------------------------------------------------------
    // Remove leading list numbers:
    //
    // 1. P23...
    // 2) P15a...
    // (3) P31...
    // ----------------------------------------------------------
    let cleanLine = rawLine
      .replace(/^\s*\(?\d+\)?[\.\s-]+\s*/, '')
      .trim();

    const cleanLower = cleanLine.toLowerCase();

    // ----------------------------------------------------------
    // Skip useless informational lines
    // ----------------------------------------------------------
    if (
      cleanLine.length < 3 ||
      /^(all with|demand on call|demand|contact|call|allotments|available|nil)\b/i.test(
        cleanLine
      ) ||
      /^(03\d{2}[- ]?\d{7}|\+92\s*3\d{2}[- ]?\d{7})$/.test(
        cleanLine
      )
    ) {
      continue;
    }

    // ----------------------------------------------------------
    // Determine society and location for THIS line
    // ----------------------------------------------------------
    let society = currentSociety;
    let precinctOrSector = currentPrecinctOrSector;
    let location = currentLocation;

    const lineBtkPrecinct = extractBtkPrecinct(cleanLine);
    const lineSector = extractSector(cleanLine);
    const linePhase = extractPhase(cleanLine);

    if (lineBtkPrecinct) {
      society = 'BTK';

      const pNum = lineBtkPrecinct.replace(/^P/, '');

      precinctOrSector = lineBtkPrecinct;
      location = `Precinct ${pNum}`;
    } else if (lineSector) {
      society = 'DCK';

      precinctOrSector = lineSector;
      location = `Sector ${lineSector}`;
    } else if (linePhase) {
      society = 'DHA';

      precinctOrSector = `Phase ${linePhase}`;
      location = `DHA Phase ${linePhase}`;
    }

    // ----------------------------------------------------------
    // Road
    // ----------------------------------------------------------
    const road = roadMatchFromLine(cleanLine);

    // ----------------------------------------------------------
    // Category
    // ----------------------------------------------------------
    let category = 'Residential';

    if (
      cleanLower.includes('commercial') ||
      /\bcomm\b/i.test(cleanLine)
    ) {
      category = 'Commercial';
    } else if (
      cleanLower.includes('villa') ||
      cleanLower.includes('house')
    ) {
      category = 'Villa';
    } else if (
      cleanLower.includes('apartment') ||
      cleanLower.includes('flat')
    ) {
      category = 'Apartment';
    } else if (
      cleanLower.includes('file')
    ) {
      category = 'Plot File';
    }

    // ----------------------------------------------------------
    // Plot number
    // ----------------------------------------------------------
    const plotNumber = extractPlotNumber(
      cleanLine,
      society
    );

    // ----------------------------------------------------------
    // SPECIAL RULE:
    //
    // A listing with no plot number is still valid if it is
    // clearly a commercial/file/offer/cancel listing.
    //
    // This fixes:
    //
    // Midway commercial cancel file for sale
    // paid amount 97lac
    // confirm offer required
    // One call done
    // ----------------------------------------------------------
    const isValidWithoutPlot =
      !plotNumber &&
      (
        category === 'Commercial' ||
        category === 'Plot File' ||
        /\b(cancel|file|for sale|paid|offer|required)\b/i.test(
          cleanLine
        )
      );

    if (!plotNumber && !isValidWithoutPlot) {
      // Do not create fake records from random informational text.
      continue;
    }

    // ----------------------------------------------------------
    // Size Sqyd
    // ----------------------------------------------------------
    let sizeSqyd = 250;

    // 512sq
    const compactSizeMatch = cleanLine.match(
      /\b(\d{2,4})\s*(?:sq\.?\s*yd|sqyd|sq\s*yard|sq\s*yards|sq)\b/i
    );

    // 512 sq yd / 512 yards / 512 yd
    const normalSizeMatch = cleanLine.match(
      /\b(\d{2,4})\s*(?:sq\.?\s*yd|sqyd|yd|yards|yard)\b/i
    );

    const sizeMatch =
      compactSizeMatch ||
      normalSizeMatch;

    if (sizeMatch) {
      sizeSqyd = parseInt(sizeMatch[1], 10);
    } else if (/\b125\b/i.test(cleanLine)) {
      sizeSqyd = 125;
    } else if (/\b200\b/i.test(cleanLine)) {
      sizeSqyd = 200;
    } else if (/\b250\b/i.test(cleanLine)) {
      sizeSqyd = 250;
    } else if (/\b350\b/i.test(cleanLine)) {
      sizeSqyd = 350;
    } else if (/\b500\b/i.test(cleanLine)) {
      sizeSqyd = 500;
    } else if (
      /\b1000\b/i.test(cleanLine) ||
      /\b1\s*kanal\b/i.test(cleanLine)
    ) {
      sizeSqyd = 1000;
    } else if (
      /\b2000\b/i.test(cleanLine) ||
      /\b2\s*kanal\b/i.test(cleanLine)
    ) {
      sizeSqyd = 2000;
    }

    // ----------------------------------------------------------
    // Price
    // ----------------------------------------------------------
    const {
      pkr,
      display
    } = parsePriceToPkr(cleanLine);

    // ----------------------------------------------------------
    // Features
    // ----------------------------------------------------------
    const features = [];

    if (
      cleanLower.includes('corner') ||
      cleanLower.includes('semi corner')
    ) {
      features.push('Corner');
    }

    if (
      cleanLower.includes('west open') ||
      /\bw\/o\b/i.test(cleanLine)
    ) {
      features.push('West Open');
    }

    if (
      cleanLower.includes('main') ||
      cleanLower.includes('boulevard') ||
      /\bmb\b/i.test(cleanLine) ||
      cleanLower.includes('jinnah')
    ) {
      features.push('Main Boulevard');
    }

    if (
      cleanLower.includes('park') ||
      cleanLower.includes('facing') ||
      /\bpf\b/i.test(cleanLine) ||
      /\bp\/f\b/i.test(cleanLine)
    ) {
      features.push('Park Facing');
    }

    if (cleanLower.includes('possession')) {
      features.push('Possession');
    }

    if (cleanLower.includes('belted')) {
      features.push('Belted');
    }

    if (cleanLower.includes('leased')) {
      features.push('Leased');
    }

    // ----------------------------------------------------------
    // Status
    // ----------------------------------------------------------
    let status = 'Available';

    if (cleanLower.includes('cancel')) {
      status = 'Cancel File';
    } else if (
      cleanLower.includes('non paid') ||
      cleanLower.includes('non-paid')
    ) {
      status = 'Non Paid';
    } else if (cleanLower.includes('paid')) {
      status = 'Paid';
    } else if (cleanLower.includes('allotment')) {
      status = 'Allotment';
    }

    // ----------------------------------------------------------
    // Agent phone
    // ----------------------------------------------------------
    const linePhoneMatch = cleanLine.match(
      /(03\d{2}[- ]?\d{7}|\+92\s*3\d{2}[- ]?\d{7})/
    );

    const agentPhone =
      linePhoneMatch
        ? linePhoneMatch[0]
        : globalPhone || '0300-1234567';

    // ----------------------------------------------------------
    // Agent name
    // ----------------------------------------------------------
    let agentName = 'Karachi Real Estate Agent';

    if (
      cleanLower.includes('call') ||
      cleanLower.includes('contact')
    ) {
      const parts = cleanLine.split(
        /\b(?:call|contact)\b\s*[:\-]?\s*/i
      );

      if (
        parts.length > 1 &&
        parts[parts.length - 1].length < 30
      ) {
        agentName =
          parts[parts.length - 1]
            .replace(/\d+/g, '')
            .trim() ||
          agentName;
      }
    }

    // ----------------------------------------------------------
    // Society name
    // ----------------------------------------------------------
    const societyName =
      society === 'BTK'
        ? 'Bahria Town Karachi'
        : society === 'DCK'
          ? 'DHA City Karachi'
          : 'DHA Karachi';

    // ----------------------------------------------------------
    // Final result
    // ----------------------------------------------------------
    results.push({
      society,
      societyName,
      location,
      precinctOrSector,

      // Blank is allowed for commercial/file listings
      plotNumber,

      category,

      sizeSqyd,
      sizeDisplay: `${sizeSqyd} Sqyd`,

      demandPricePkr: pkr,
      demandDisplay: display,

      features:
        features.length > 0
          ? features
          : ['Standard Location'],

      agentName:
        agentName || 'Prime Estate Agent',

      agentPhone,

      agencyName:
        'Karachi Real Estate Network',

      status,

      rawText: rawLine,

      createdAt:
        new Date().toISOString(),

      offers: []
    });
  }

  return results;
}
