import express from 'express';
import { body } from 'express-validator';
import * as issueController from '../controllers/issue.controller.js';

const router = express.Router();

const issueValidation = [
  body('assetId').notEmpty().withMessage('Please select an asset'),
  body('employeeId').notEmpty().withMessage('Please select an employee')
];

router.get('/', issueController.renderIssueForm);
router.post('/', issueValidation, issueController.issueAsset);

export default router;
