import express from 'express';
import { createSchedule, getSchedule } from '../controllers/studyScheduleController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/generate', createSchedule);
router.get('/:enrollmentId', getSchedule);

export default router;
