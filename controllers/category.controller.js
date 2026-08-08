import { validationResult } from 'express-validator';
import * as categoryService from '../services/category.service.js';

export const listCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.render('categories/list', { title: 'Asset Category Master', categories });
  } catch (err) {
    next(err);
  }
};

export const renderNewForm = (req, res) => {
  res.render('categories/form', { title: 'Add Category', category: {}, errors: [] });
};

export const createCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('categories/form', {
      title: 'Add Category',
      category: req.body,
      errors: errors.array()
    });
  }
  try {
    await categoryService.createCategory(req.body);
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
};

export const renderEditForm = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/categories');
    }
    res.render('categories/form', { title: 'Edit Category', category, errors: [] });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    const category = await categoryService.getCategoryById(req.params.id);
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
    await categoryService.updateCategory(req.params.id, req.body);
    req.flash('success', 'Category updated successfully');
    res.redirect('/categories');
  } catch (err) {
    next(err);
  }
};
