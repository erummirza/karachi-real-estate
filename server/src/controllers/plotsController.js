import { Plot } from '../models/Plot.js';

/**
 * GET /api/plots
 * GET /api/plots?ownerAgentId=xyz  -> only that agent's own listings
 */
export async function getAllPlots(req, res) {
  try {
    const { ownerAgentId } = req.query;
    const query = ownerAgentId ? { ownerAgentId } : {};
    const plots = await Plot.find(query).sort({ createdAt: -1 });
    res.json(plots);
  } catch (err) {
    console.error('Failed to fetch plots:', err);
    res.status(500).json({ error: 'Failed to fetch plots' });
  }
}

/**
 * POST /api/plots/import
 * Body: { items: [...], ownerAgentId?, ownerAgentName? }
 * When ownerAgentId is provided, every inserted plot is tagged with it so the
 * agent can later be shown only their own listings.
 */
export async function importPlots(req, res) {
  try {
    const { items, ownerAgentId, ownerAgentName } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items must be a non-empty array' });
    }

    const itemsWithOwner = items.map(item => ({
      ...item,
      ownerAgentId: ownerAgentId || null,
      ownerAgentName: ownerAgentName || null,
    }));

    const inserted = await Plot.insertMany(itemsWithOwner, { ordered: false });
    res.status(201).json(inserted);
  } catch (err) {
    console.error('Failed to import plots:', err);
    res.status(400).json({ error: err.message || 'Failed to import plots' });
  }
}

/** POST /api/plots/:plotId/offers */
export async function addOffer(req, res) {
  try {
    const { plotId } = req.params;
    const offer = req.body;

    if (!offer || !offer.id || !offer.offeredPricePkr) {
      return res.status(400).json({ error: 'Invalid offer payload' });
    }

    const plot = await Plot.findOne({ id: plotId });
    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }

    plot.offers.push({ ...offer, plotId });
    if (plot.status === 'Available') {
      plot.status = 'Under Offer';
    }

    await plot.save();
    res.status(201).json(plot);
  } catch (err) {
    console.error('Failed to add offer:', err);
    res.status(400).json({ error: err.message || 'Failed to add offer' });
  }
}

/** PATCH /api/plots/:plotId/offers/:offerId */
export async function updateOfferStatus(req, res) {
  try {
    const { plotId, offerId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Countered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const plot = await Plot.findOne({ id: plotId });
    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }

    const offer = plot.offers.find(o => o.id === offerId);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    offer.status = status;
    if (status === 'Accepted') {
      plot.status = 'Sold';
    }

    await plot.save();
    res.json(plot);
  } catch (err) {
    console.error('Failed to update offer status:', err);
    res.status(400).json({ error: err.message || 'Failed to update offer status' });
  }
}