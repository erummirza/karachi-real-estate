import { Router } from 'express';
import {
  getAllPlots,
  importPlots,
  addOffer,
  updateOfferStatus,
} from '../controllers/plotsController.js';

const router = Router();

router.get('/', getAllPlots);
router.post('/import', importPlots);
router.post('/:plotId/offers', addOffer);
router.patch('/:plotId/offers/:offerId', updateOfferStatus);

export default router;
