import { Router } from 'express';
import { parseInventory } from '../controllers/parseInventoryController.js';

const router = Router();

router.post('/', parseInventory);

export default router;
