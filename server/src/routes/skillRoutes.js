import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { listSkills, getSkill, createSkill, updateSkill, deleteSkill } from '../controllers/skillController.js';

const router = express.Router();

router.get('/', listSkills);
router.get('/:id', getSkill);

router.post('/', protect, authorize('ADMIN'), createSkill);
router.put('/:id', protect, authorize('ADMIN'), updateSkill);
router.delete('/:id', protect, authorize('ADMIN'), deleteSkill);

export default router;
