import { Router } from 'express';
import { registerAgent, getAllAgents, updateAgentStatus } from '../controllers/agentsController.js';

const router = Router();

router.post('/register', registerAgent);
router.get('/', getAllAgents);
router.patch('/:agentId/status', updateAgentStatus);

export default router;
