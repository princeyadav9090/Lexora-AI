import express from 'express';
import { getLawyers, getLawyerDetail } from '../controllers/lawyerController.js';

const router = express.Router();

router.get('/', getLawyers);
router.get('/:id', getLawyerDetail);

export default router;
