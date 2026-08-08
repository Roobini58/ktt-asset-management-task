import { validationResult } from 'express-validator';
import * as assetService from '../services/asset.service.js';
import * as categoryService from '../services/category.service.js';

export const listAssets = async (req, res, next) => {
  try {
    const { categoryId = '', q = '' } = req.query;
    const { assets, categories } = await assetService.getAssetMasterList(categoryId, q);
    res.render('assets/list', {
      title: 'Asset Master',
      assets,
      categories,
      filters: { categoryId, q }
    });
  } catch (err) {
    next(err);
  }
};

export const renderNewForm = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.render('assets/form', { title: 'Add Asset', asset: {}, categories, errors: [] });
  } catch (err) {
    next(err);
  }
};

export const createAsset = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const categories = await categoryService.getAllCategories();
    return res.status(422).render('assets/form', {
      title: 'Add Asset',
      asset: req.body,
      categories,
      errors: errors.array()
    });
  }
  try {
    await assetService.createAssetWithTransaction(req.body);
    req.flash('success', 'Asset created successfully');
    res.redirect('/assets');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      const categories = await categoryService.getAllCategories();
      return res.status(422).render('assets/form', {
        title: 'Add Asset',
        asset: req.body,
        categories,
        errors: [{ msg: 'Serial number already exists' }]
      });
    }
    next(err);
  }
};

export const renderEditForm = async (req, res, next) => {
  try {
    const [asset, categories] = await Promise.all([
      assetService.getAssetById(req.params.id),
      categoryService.getAllCategories()
    ]);
    if (!asset) {
      req.flash('error', 'Asset not found');
      return res.redirect('/assets');
    }
    res.render('assets/form', { title: 'Edit Asset', asset, categories, errors: [] });
  } catch (err) {
    next(err);
  }
};

export const updateAsset = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    const asset = await assetService.getAssetById(req.params.id);
    if (!asset) {
      req.flash('error', 'Asset not found');
      return res.redirect('/assets');
    }
    if (!errors.isEmpty()) {
      const categories = await categoryService.getAllCategories();
      return res.status(422).render('assets/form', {
        title: 'Edit Asset',
        asset: { ...asset.toJSON(), ...req.body },
        categories,
        errors: errors.array()
      });
    }
    await assetService.updateAsset(req.params.id, req.body);
    req.flash('success', 'Asset updated successfully');
    res.redirect('/assets');
  } catch (err) {
    next(err);
  }
};

export const viewAsset = async (req, res, next) => {
  try {
    const asset = await assetService.getAssetDetails(req.params.id);
    if (!asset) {
      req.flash('error', 'Asset not found');
      return res.redirect('/assets');
    }
    res.render('assets/view', { title: asset.serialNumber, asset });
  } catch (err) {
    next(err);
  }
};
