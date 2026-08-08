import { validationResult } from 'express-validator';
import * as employeeService from '../services/employee.service.js';

export const listEmployees = async (req, res, next) => {
  try {
    const { status = 'all', q = '' } = req.query;
    const employees = await employeeService.getEmployees(status, q);
    res.render('employees/list', { title: 'Employee Master', employees, filters: { status, q } });
  } catch (err) {
    next(err);
  }
};

export const renderNewForm = (req, res) => {
  res.render('employees/form', { title: 'Add Employee', employee: {}, errors: [] });
};

export const createEmployee = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('employees/form', {
      title: 'Add Employee',
      employee: req.body,
      errors: errors.array()
    });
  }
  try {
    await employeeService.createEmployee(req.body);
    req.flash('success', 'Employee created successfully');
    res.redirect('/employees');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(422).render('employees/form', {
        title: 'Add Employee',
        employee: req.body,
        errors: [{ msg: 'Employee code already exists' }]
      });
    }
    next(err);
  }
};

export const renderEditForm = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    if (!employee) {
      req.flash('error', 'Employee not found');
      return res.redirect('/employees');
    }
    res.render('employees/form', { title: 'Edit Employee', employee, errors: [] });
  } catch (err) {
    next(err);
  }
};

export const updateEmployee = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    if (!employee) {
      req.flash('error', 'Employee not found');
      return res.redirect('/employees');
    }
    if (!errors.isEmpty()) {
      return res.status(422).render('employees/form', {
        title: 'Edit Employee',
        employee: { ...employee.toJSON(), ...req.body },
        errors: errors.array()
      });
    }
    await employeeService.updateEmployee(req.params.id, req.body);
    req.flash('success', 'Employee updated successfully');
    res.redirect('/employees');
  } catch (err) {
    next(err);
  }
};

export const viewEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id, true);
    if (!employee) {
      req.flash('error', 'Employee not found');
      return res.redirect('/employees');
    }
    res.render('employees/view', { title: employee.name, employee });
  } catch (err) {
    next(err);
  }
};
