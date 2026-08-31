import { Router } from 'express';
import {
  saveTrack,
  getLibrary,
  deleteTrack,
} from '../controllers/library.controller.js';

const router = Router();

router.post('/', saveTrack);
router.get('/', getLibrary);
router.delete('/:audiusTrackId', deleteTrack);

export default router;
