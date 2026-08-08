import express from 'express';
import { body } from 'express-validator';
import * as assetController from '../controllers/asset.controller.js';

const router = express.Router();

const assetValidation = [
  body('serialNumber').trim().notEmpty().withMessage('Serial number is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('purchaseValue').isFloat({ min: 0 }).withMessage('Purchase value must be a positive number')
];

router.get('/', assetController.listAssets);
router.get('/new', assetController.renderNewForm);
router.post('/', assetValidation, assetController.createAsset);
router.get('/:id/edit', assetController.renderEditForm);
router.put('/:id', assetValidation, assetController.updateAsset);
router.get('/:id', assetController.viewAsset);

export default router;
