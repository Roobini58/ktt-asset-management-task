import express from 'express';
import { body } from 'express-validator';
import * as scrapController from '../controllers/scrap.controller.js';

const router = express.Router();

const scrapValidation = [
  body('assetId').notEmpty().withMessage('Please select an asset'),
  body('remarks').trim().notEmpty().withMessage('Please provide a reason for scrapping')
];

router.get('/', scrapController.renderScrapForm);
router.post('/', scrapValidation, scrapController.scrapAsset);

export default router;
