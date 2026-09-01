const BASE_URL = 'https://karachi-real-estate-api.vercel.app/api/plots';


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

/** Fetch all plots. */
export async function getPlots() {
  const res = await fetch(BASE_URL);
  return handleResponse(res);
}

/** Import a batch of newly parsed plots. Returns the inserted plots. */
export async function importPlots(items) {
  const res = await fetch(`${BASE_URL}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
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
