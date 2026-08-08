import express from 'express';
import { Op } from 'sequelize';
import { body, validationResult } from 'express-validator';
import { Asset, AssetCategory, Employee, AssetTransaction, sequelize } from '../models/index.js';

const router = express.Router();

// Asset Master list - filters by category, search by make/model/serial.
// Scrapped assets are excluded here per spec (visible only in reports/history).
router.get('/', async (req, res, next) => {
  try {
    const { categoryId = '', q = '' } = req.query;
    const where = { status: { [Op.ne]: 'SCRAPPED' } };

    if (categoryId) where.categoryId = categoryId;
    if (q) {
      where[Op.or] = [
        { serialNumber: { [Op.iLike]: `%${q}%` } },
        { make: { [Op.iLike]: `%${q}%` } },
        { model: { [Op.iLike]: `%${q}%` } }
      ];
    }

    const [assets, categories] = await Promise.all([
      Asset.findAll({
        where,
        include: [
          { model: AssetCategory, as: 'category' },
          { model: Employee, as: 'currentEmployee' }
        ],
        order: [['created_at', 'DESC']]
      }),
      AssetCategory.findAll({ order: [['name', 'ASC']] })
    ]);

    res.render('assets/list', {
      title: 'Asset Master',
      assets,
      categories,
      filters: { categoryId, q }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/new', async (req, res, next) => {
  try {
    const categories = await AssetCategory.findAll({ order: [['name', 'ASC']] });
    res.render('assets/form', { title: 'Add Asset', asset: {}, categories, errors: [] });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  [
    body('serialNumber').trim().notEmpty().withMessage('Serial number is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('purchaseValue').isFloat({ min: 0 }).withMessage('Purchase value must be a positive number')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const categories = await AssetCategory.findAll({ order: [['name', 'ASC']] });
      return res.status(422).render('assets/form', {
        title: 'Add Asset',
        asset: req.body,
        categories,
        errors: errors.array()
      });
    }
    const t = await sequelize.transaction();
    try {
      const asset = await Asset.create(
        {
          serialNumber: req.body.serialNumber,
          categoryId: req.body.categoryId,
          make: req.body.make || null,
          model: req.body.model || null,
          branch: req.body.branch || null,
          purchaseDate: req.body.purchaseDate || null,
          purchaseValue: req.body.purchaseValue || 0,
          notes: req.body.notes || null,
          status: 'IN_STOCK'
        },
        { transaction: t }
      );
      await AssetTransaction.create(
        {
          assetId: asset.id,
          action: 'PURCHASED',
          remarks: 'Asset added to inventory',
          actionDate: req.body.purchaseDate || new Date()
        },
        { transaction: t }
      );
      await t.commit();
      req.flash('success', 'Asset created successfully');
      res.redirect('/assets');
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        const categories = await AssetCategory.findAll({ order: [['name', 'ASC']] });
        return res.status(422).render('assets/form', {
          title: 'Add Asset',
          asset: req.body,
          categories,
          errors: [{ msg: 'Serial number already exists' }]
        });
      }
      next(err);
    }
  }
);

router.get('/:id/edit', async (req, res, next) => {
  try {
    const [asset, categories] = await Promise.all([
      Asset.findByPk(req.params.id),
      AssetCategory.findAll({ order: [['name', 'ASC']] })
    ]);
    if (!asset) {
      req.flash('error', 'Asset not found');
      return res.redirect('/assets');
    }
    res.render('assets/form', { title: 'Edit Asset', asset, categories, errors: [] });
  } catch (err) {
    next(err);
  }
});

router.put(
  '/:id',
  [
    body('serialNumber').trim().notEmpty().withMessage('Serial number is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('purchaseValue').isFloat({ min: 0 }).withMessage('Purchase value must be a positive number')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    try {
      const asset = await Asset.findByPk(req.params.id);
      if (!asset) {
        req.flash('error', 'Asset not found');
        return res.redirect('/assets');
      }
      if (!errors.isEmpty()) {
        const categories = await AssetCategory.findAll({ order: [['name', 'ASC']] });
        return res.status(422).render('assets/form', {
          title: 'Edit Asset',
          asset: { ...asset.toJSON(), ...req.body },
          categories,
          errors: errors.array()
        });
      }
      await asset.update({
        serialNumber: req.body.serialNumber,
        categoryId: req.body.categoryId,
        make: req.body.make || null,
        model: req.body.model || null,
        branch: req.body.branch || null,
        purchaseDate: req.body.purchaseDate || null,
        purchaseValue: req.body.purchaseValue || 0,
        notes: req.body.notes || null
      });
      req.flash('success', 'Asset updated successfully');
      res.redirect('/assets');
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id', async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { model: AssetCategory, as: 'category' },
        { model: Employee, as: 'currentEmployee' }
      ]
    });
    if (!asset) {
      req.flash('error', 'Asset not found');
      return res.redirect('/assets');
    }
    res.render('assets/view', { title: asset.serialNumber, asset });
  } catch (err) {
    next(err);
  }
});

export default router;
