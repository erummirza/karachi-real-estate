 const BASE_URL = 'https://karachi-real-estate-api.vercel.app/api/agents'; // PRODUCTION - uncomment before deploying
//const BASE_URL = 'http://localhost:5000/api/agents'; // LOCAL - for testing only

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

/** Sign up (set a password) for an already-approved agent, using cell number as username. */
export async function signupAgent({ contactPhone, password, confirmPassword }) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contactPhone, password, confirmPassword }),
  });
  return handleResponse(res);
}

/** Log an approved agent in using cell number + password. */
export async function loginAgent({ contactPhone, password }) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contactPhone, password }),
  });
  return handleResponse(res);
}