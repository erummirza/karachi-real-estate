//const BASE_URL = '/api/agents';
const BASE_URL = 'https://karachi-real-estate-api.vercel.app/api/agents';

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

/** Register a new agent profile. Returns the created agent (status: Pending). */
export async function registerAgent(agentData) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agentData),
  });
  return handleResponse(res);
}

/** Fetch all registered agents (for the admin panel). */
export async function getAgents() {
  const res = await fetch(BASE_URL);
  return handleResponse(res);
}

/** Approve or reject an agent's registration. */
export async function updateAgentStatus(agentId, status) {
  const res = await fetch(`${BASE_URL}/${agentId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}
