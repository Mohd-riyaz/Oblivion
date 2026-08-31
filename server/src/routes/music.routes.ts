import { Router } from 'express';
import {
  searchMusic,
  getTrending,
  getNewReleases,
  getGenreTracks,
} from '../controllers/music.controller.js';

const router = Router();

router.get('/search', searchMusic);
router.get('/trending', getTrending);
router.get('/new-releases', getNewReleases);
router.get('/genre', getGenreTracks);

export default router;
