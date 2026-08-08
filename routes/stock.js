import express from 'express';
import * as stockController from '../controllers/stock.controller.js';

const router = express.Router();

router.get('/', stockController.viewStock);

export default router;
