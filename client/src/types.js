/**
 * Shared shape definitions for the app. These are JSDoc hints for editor
 * autocomplete only — there is no runtime TypeScript checking here.
 *
 * @typedef {'BTK' | 'DCK' | 'DHA'} Society
 * @typedef {'Residential' | 'Commercial' | 'Villa' | 'Apartment' | 'Plot File'} PropertyCategory
 *
 * @typedef {Object} PlotOffer
 * @property {string} id
 * @property {string} plotId
 * @property {number} offeredPricePkr
 * @property {string} offeredDisplay
 * @property {string} offeringAgentName
 * @property {string} offeringAgentPhone
 * @property {string} offeringAgency
 * @property {string} terms
 * @property {'Pending' | 'Accepted' | 'Rejected' | 'Countered'} status
 * @property {string} createdAt
 *
 * @typedef {Object} PlotItem
 * @property {string} id
 * @property {Society} society
 * @property {string} societyName
 * @property {string} location - e.g. "Precinct 10A", "Sector 3A", "Phase 6"
 * @property {string} precinctOrSector - Normalized key e.g. "P10A", "3A", "Ph6"
 * @property {string} plotNumber
 * @property {PropertyCategory} category
 * @property {number} sizeSqyd
 * @property {string} sizeDisplay
 * @property {number} demandPricePkr
 * @property {string} demandDisplay
 * @property {string[]} features
 * @property {string} agentName
 * @property {string} agentPhone
 * @property {string} agencyName
 * @property {'Available' | 'Under Offer' | 'Sold'} status
 * @property {string} [notes]
 * @property {string} [rawText]
 * @property {string} createdAt
 * @property {PlotOffer[]} offers
 *
 * @typedef {Object} FilterState
 * @property {Society | 'ALL'} society
 * @property {string} precinctOrSector - "ALL" or specific precinct P1-P63, sector 1A-14B, phase 1-8
 * @property {string} category - "ALL" or specific
 * @property {number | 'ALL'} sizeSqyd
 * @property {number} minPricePkr
 * @property {number} maxPricePkr
 * @property {string[]} features
 * @property {string} searchQuery
 * @property {string} status - "ALL", "Available", "Under Offer"
 * @property {'price-asc' | 'price-desc' | 'date-desc' | 'plot-asc' | 'precinct-asc'} sortBy
 */

export {};
