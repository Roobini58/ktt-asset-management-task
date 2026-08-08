import express from 'express';
import { body } from 'express-validator';
import * as employeeController from '../controllers/employee.controller.js';

const router = express.Router();

const employeeValidation = [
  body('employeeCode').trim().notEmpty().withMessage('Employee code is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email is invalid')
];

router.get('/', employeeController.listEmployees);
router.get('/new', employeeController.renderNewForm);
router.post('/', employeeValidation, employeeController.createEmployee);
router.get('/:id/edit', employeeController.renderEditForm);
router.put('/:id', employeeValidation, employeeController.updateEmployee);
router.get('/:id', employeeController.viewEmployee);

export default router;
