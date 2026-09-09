import { Router } from 'express';
import { registerAgent, getAllAgents, updateAgentStatus, signupAgent, loginAgent } from '../controllers/agentsController.js';

const router = Router();

router.post('/register', registerAgent);
router.post('/signup', signupAgent);
router.post('/login', loginAgent);
router.get('/', getAllAgents);
router.patch('/:agentId/status', updateAgentStatus);

export default router;