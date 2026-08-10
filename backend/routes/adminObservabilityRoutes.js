import express from 'express';
import { getObservabilitySummary } from '../controllers/observabilityController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', protect, admin, getObservabilitySummary);

export default router;
