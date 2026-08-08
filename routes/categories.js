import express from 'express';
import { body } from 'express-validator';
import * as categoryController from '../controllers/category.controller.js';

const router = express.Router();

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required')
];

router.get('/', categoryController.listCategories);
router.get('/new', categoryController.renderNewForm);
router.post('/', categoryValidation, categoryController.createCategory);
router.get('/:id/edit', categoryController.renderEditForm);
router.put('/:id', categoryValidation, categoryController.updateCategory);

export default router;
