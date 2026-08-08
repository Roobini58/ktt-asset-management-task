import express from 'express';
import { body } from 'express-validator';
import * as returnController from '../controllers/return.controller.js';

const router = express.Router();

const returnValidation = [
  body('assetId').notEmpty().withMessage('Please select an asset'),
  body('reason').notEmpty().withMessage('Please select a return reason')
];

router.get('/', returnController.renderReturnForm);
router.post('/', returnValidation, returnController.returnAsset);

export default router;
