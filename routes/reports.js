import express from 'express';
import * as reportController from '../controllers/report.controller.js';

const router = express.Router();

router.get('/', reportController.viewReports);

export default router;
