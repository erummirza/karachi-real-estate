import bcrypt from 'bcryptjs';
import { Agent } from '../models/Agent.js';

/** POST /api/agents/register */
export async function registerAgent(req, res) {
  try {
    const { fullName, cnicNumber, contactPhone, password, agencyName, operatingCity } = req.body;
    const missing = [];
    if (!fullName) missing.push('Full Name');
    if (!cnicNumber) missing.push('CNIC/ID Number');
    if (!contactPhone) missing.push('Contact Phone');
    if (!password) missing.push('Password');
    if (!agencyName) missing.push('Agency Name');
    if (!operatingCity) missing.push('Operating City/Location');
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const existing = await Agent.findOne({ $or: [{ cnicNumber }, { contactPhone }] });
    if (existing) {
      return res.status(409).json({ error: 'An agent with this CNIC/ID Number or Contact Phone is already registered.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const agent = await Agent.create({
      id: `agent-${Date.now()}`,
      fullName,
      cnicNumber,
      contactPhone,
      password: passwordHash,
      agencyName,
      operatingCity,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(agent);
  } catch (err) {
    console.error('Failed to register agent:', err);
    res.status(400).json({ error: err.message || 'Failed to register agent' });
  }
}

/** GET /api/agents */
export async function getAllAgents(req, res) {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });
    res.json(agents);
  } catch (err) {
    console.error('Failed to fetch agents:', err);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
}

/** PATCH /api/agents/:agentId/status */
export async function updateAgentStatus(req, res) {
  try {
    const { agentId } = req.params;
    const { status } = req.body;
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const agent = await Agent.findOne({ id: agentId });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    agent.status = status;
    agent.reviewedAt = new Date().toISOString();
    await agent.save();
    res.json(agent);
  } catch (err) {
    console.error('Failed to update agent status:', err);
    res.status(400).json({ error: err.message || 'Failed to update agent status' });
  }
}

/**
 * POST /api/agents/login
 * Logs an approved agent in using their CNIC/ID Number and the password they set at registration.
 */
export async function loginAgent(req, res) {
  try {
    const { cnicNumber, password } = req.body;
    if (!cnicNumber || !password) {
      return res.status(400).json({ error: 'CNIC/ID Number and password are required.' });
    }

    const agent = await Agent.findOne({ cnicNumber });
    if (!agent) {
      return res.status(404).json({ error: 'No agent account found for that CNIC/ID Number.' });
    }
    if (agent.status !== 'Approved') {
      return res.status(403).json({
        error: agent.status === 'Pending'
          ? 'Your registration is still pending admin approval.'
          : 'Your agent registration was not approved.',
      });
    }

    const matches = await bcrypt.compare(password, agent.password);
    if (!matches) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    res.json({ message: 'Login successful.', agent });
  } catch (err) {
    console.error('Failed to log in agent:', err);
    res.status(400).json({ error: err.message || 'Failed to log in.' });
  }
}