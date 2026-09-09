 const BASE_URL = 'https://karachi-real-estate-api.vercel.app/api/plots'; // PRODUCTION - uncomment before deploying
//const BASE_URL = 'http://localhost:5000/api/plots'; // LOCAL - for testing only

async function handleResponse(res) {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore parse errors, use default message
    }
    throw new Error(message);
  }
  return res.json();
}

/**
 * Fetch plots. Pass an ownerAgentId to get only that agent's own listings
 * (used by the agent dashboard); omit it to get everything (admin view).
 */
export async function getPlots(ownerAgentId) {
  const url = ownerAgentId ? `${BASE_URL}?ownerAgentId=${encodeURIComponent(ownerAgentId)}` : BASE_URL;
  const res = await fetch(url);
  return handleResponse(res);
}

/**
 * Import a batch of newly parsed plots. Pass `owner` as
 * { ownerAgentId, ownerAgentName } when an agent (not admin) is importing,
 * so the new listings are tagged to their account.
 */
export async function importPlots(items, owner) {
  const res = await fetch(`${BASE_URL}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, ...(owner || {}) }),
  });
  return handleResponse(res);
}

/** Submit a new offer on a plot. Returns the updated plot. */
export async function submitOffer(plotId, offer) {
  const res = await fetch(`${BASE_URL}/${plotId}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(offer),
  });
  return handleResponse(res);
}

/** Update an existing offer's status. Returns the updated plot. */
export async function updateOfferStatus(plotId, offerId, status) {
  const res = await fetch(`${BASE_URL}/${plotId}/offers/${offerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}