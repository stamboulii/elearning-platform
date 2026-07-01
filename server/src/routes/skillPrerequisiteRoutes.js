import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createPrerequisite, deletePrerequisite } from '../controllers/skillPrerequisiteController.js';

const router = express.Router();

router.post('/', protect, authorize('ADMIN'), createPrerequisite);
router.delete('/:id', protect, authorize('ADMIN'), deletePrerequisite);

export default router;
