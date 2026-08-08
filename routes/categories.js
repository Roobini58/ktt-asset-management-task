import express from 'express';
import { body, validationResult } from 'express-validator';
import { AssetCategory } from '../models/index.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const categories = await AssetCategory.findAll({ order: [['name', 'ASC']] });
    res.render('categories/list', { title: 'Asset Category Master', categories });
  } catch (err) {
    next(err);
  }
});

router.get('/new', (req, res) => {
  res.render('categories/form', { title: 'Add Category', category: {}, errors: [] });
});

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('categories/form', {
        title: 'Add Category',
        category: req.body,
        errors: errors.array()
      });
    }
    try {
      await AssetCategory.create({ name: req.body.name, description: req.body.description || null });
      req.flash('success', 'Category created successfully');
      res.redirect('/categories');
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(422).render('categories/form', {
          title: 'Add Category',
          category: req.body,
          errors: [{ msg: 'Category name already exists' }]
        });
      }
      next(err);
    }
  }
);

router.get('/:id/edit', async (req, res, next) => {
  try {
    const category = await AssetCategory.findByPk(req.params.id);
    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/categories');
    }
    res.render('categories/form', { title: 'Edit Category', category, errors: [] });
  } catch (err) {
    next(err);
  }
});

router.put(
  '/:id',
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  async (req, res, next) => {
    const errors = validationResult(req);
    try {
      const category = await AssetCategory.findByPk(req.params.id);
      if (!category) {
        req.flash('error', 'Category not found');
        return res.redirect('/categories');
      }
      if (!errors.isEmpty()) {
        return res.status(422).render('categories/form', {
          title: 'Edit Category',
          category: { ...category.toJSON(), ...req.body },
          errors: errors.array()
        });
      }
      await category.update({ name: req.body.name, description: req.body.description || null });
      req.flash('success', 'Category updated successfully');
      res.redirect('/categories');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
