import bcrypt from 'bcryptjs';
import { Agent } from '../models/Agent.js';

/** POST /api/agents/register */
export async function registerAgent(req, res) {
  try {
    const { fullName, cnicNumber, contactPhone, agencyName, operatingCity, licenseCredentials } = req.body;
    const missing = [];
    if (!fullName) missing.push('Full Name');
    if (!cnicNumber) missing.push('CNIC/ID Number');
    if (!contactPhone) missing.push('Contact Phone');
    if (!agencyName) missing.push('Agency Name');
    if (!operatingCity) missing.push('Operating City/Location');
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
    }
    const existing = await Agent.findOne({ $or: [{ cnicNumber }, { contactPhone }] });
    if (existing) {
      return res.status(409).json({ error: 'An agent with this CNIC/ID Number or Contact Phone is already registered.' });
    }
    const agent = await Agent.create({
      id: `agent-${Date.now()}`,
      fullName,
      cnicNumber,
      contactPhone,
      agencyName,
      operatingCity,
      licenseCredentials,
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
 * POST /api/agents/signup
 * Lets an agent set a login password using their registered cell number as the username.
 * Only allowed once the admin has marked that agent's registration as "Approved".
 */
export async function signupAgent(req, res) {
  try {
    const { contactPhone, password, confirmPassword } = req.body;

    if (!contactPhone || !password) {
      return res.status(400).json({ error: 'Cell number and password are required.' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const agent = await Agent.findOne({ contactPhone });
    if (!agent) {
      return res.status(404).json({
        error: 'No agent registration found for this cell number. Please register as an agent first.',
      });
    }

    if (agent.status === 'Pending') {
      return res.status(403).json({
        error: 'Your registration is still pending admin approval. You can sign up once approved.',
      });
    }
    if (agent.status === 'Rejected') {
      return res.status(403).json({
        error: 'Your agent registration was not approved, so sign up is unavailable.',
      });
    }
    // Only remaining status is 'Approved' from here on.

    if (agent.password) {
      return res.status(409).json({
        error: 'An account already exists for this cell number. Please sign in instead.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    agent.password = passwordHash;
    await agent.save();

    res.status(201).json({ message: 'Account created successfully. You can now sign in.', agent });
  } catch (err) {
    console.error('Failed to sign up agent:', err);
    res.status(400).json({ error: err.message || 'Failed to sign up.' });
  }
}

/**
 * POST /api/agents/login
 * Logs an approved agent in using their cell number and password.
 */
export async function loginAgent(req, res) {
  try {
    const { contactPhone, password } = req.body;
    if (!contactPhone || !password) {
      return res.status(400).json({ error: 'Cell number and password are required.' });
    }

    const agent = await Agent.findOne({ contactPhone });
    if (!agent) {
      return res.status(404).json({ error: 'No agent account found for this cell number.' });
    }
    if (agent.status !== 'Approved') {
      return res.status(403).json({
        error: agent.status === 'Pending'
          ? 'Your registration is still pending admin approval.'
          : 'Your agent registration was not approved.',
      });
    }
    if (!agent.password) {
      return res.status(400).json({ error: 'No account set up yet. Please sign up first.' });
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