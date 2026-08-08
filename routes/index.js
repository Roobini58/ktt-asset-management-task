import express from 'express';
import { Asset, Employee, AssetCategory } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [totalAssets, inStock, issued, scrapped, totalEmployees, totalCategories] = await Promise.all([
      Asset.count(),
      Asset.count({ where: { status: 'IN_STOCK' } }),
      Asset.count({ where: { status: 'ISSUED' } }),
      Asset.count({ where: { status: 'SCRAPPED' } }),
      Employee.count({ where: { isActive: true } }),
      AssetCategory.count()
    ]);

    res.render('index', {
      title: 'Dashboard',
      stats: { totalAssets, inStock, issued, scrapped, totalEmployees, totalCategories }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
