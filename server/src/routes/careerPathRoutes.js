import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { listCareerPaths, getCareerPath, getMyProgress, createCareerPath, addSkillToCareerPath } from '../controllers/careerPathController.js';

const router = express.Router();

router.get('/', listCareerPaths);
router.get('/:id', getCareerPath);
router.get('/:id/my-progress', protect, getMyProgress);

router.post('/', protect, authorize('ADMIN'), createCareerPath);
router.post('/:id/skills', protect, authorize('ADMIN'), addSkillToCareerPath);

export default router;
