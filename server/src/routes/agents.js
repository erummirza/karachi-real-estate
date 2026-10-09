import { Router } from 'express';
import { registerAgent, getAllAgents, updateAgentStatus, loginAgent } from '../controllers/agentsController.js';

const router = Router();

router.post('/register', registerAgent);
router.post('/login', loginAgent);
router.get('/', getAllAgents);
router.patch('/:agentId/status', updateAgentStatus);

export default router;