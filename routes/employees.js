import express from 'express';
import { Op } from 'sequelize';
import { body, validationResult } from 'express-validator';
import { Employee } from '../models/index.js';

const router = express.Router();

// List with filters (active/inactive) + search
router.get('/', async (req, res, next) => {
  try {
    const { status = 'all', q = '' } = req.query;
    const where = {};

    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { employeeCode: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
        { department: { [Op.iLike]: `%${q}%` } }
      ];
    }

    const employees = await Employee.findAll({ where, order: [['name', 'ASC']] });
    res.render('employees/list', { title: 'Employee Master', employees, filters: { status, q } });
  } catch (err) {
    next(err);
  }
});

router.get('/new', (req, res) => {
  res.render('employees/form', { title: 'Add Employee', employee: {}, errors: [] });
});

router.post(
  '/',
  [
    body('employeeCode').trim().notEmpty().withMessage('Employee code is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email is invalid')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('employees/form', {
        title: 'Add Employee',
        employee: req.body,
        errors: errors.array()
      });
    }
    try {
      await Employee.create({
        employeeCode: req.body.employeeCode,
        name: req.body.name,
        email: req.body.email || null,
        phone: req.body.phone || null,
        department: req.body.department || null,
        designation: req.body.designation || null,
        branch: req.body.branch || null,
        isActive: req.body.isActive === 'on' || req.body.isActive === 'true'
      });
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
  }
);

router.get('/:id/edit', async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      req.flash('error', 'Employee not found');
      return res.redirect('/employees');
    }
    res.render('employees/form', { title: 'Edit Employee', employee, errors: [] });
  } catch (err) {
    next(err);
  }
});

router.put(
  '/:id',
  [
    body('employeeCode').trim().notEmpty().withMessage('Employee code is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email is invalid')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    try {
      const employee = await Employee.findByPk(req.params.id);
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
      await employee.update({
        employeeCode: req.body.employeeCode,
        name: req.body.name,
        email: req.body.email || null,
        phone: req.body.phone || null,
        department: req.body.department || null,
        designation: req.body.designation || null,
        branch: req.body.branch || null,
        isActive: req.body.isActive === 'on' || req.body.isActive === 'true'
      });
      req.flash('success', 'Employee updated successfully');
      res.redirect('/employees');
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id', async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [{ association: 'assetsHeld' }]
    });
    if (!employee) {
      req.flash('error', 'Employee not found');
      return res.redirect('/employees');
    }
    res.render('employees/view', { title: employee.name, employee });
  } catch (err) {
    next(err);
  }
});

export default router;
