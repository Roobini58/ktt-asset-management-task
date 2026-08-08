import express from 'express';
import * as historyController from '../controllers/history.controller.js';

const router = express.Router();

router.get('/', historyController.searchHistory);
router.get('/:id', historyController.viewAssetHistory);

export default router;
