import express from 'express';
import { Op } from 'sequelize';
import { Asset, AssetCategory, Employee, AssetTransaction } from '../models/index.js';

const router = express.Router();

// Search/select any asset (including scrapped ones) to view its full lifecycle
router.get('/', async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const where = {};
    if (q) {
      where[Op.or] = [
        { serialNumber: { [Op.iLike]: `%${q}%` } },
        { make: { [Op.iLike]: `%${q}%` } },
        { model: { [Op.iLike]: `%${q}%` } }
      ];
    }
    const assets = await Asset.findAll({
      where,
      include: [{ model: AssetCategory, as: 'category' }],
      order: [['serialNumber', 'ASC']]
    });
    res.render('history/search', { title: 'Asset History', assets, filters: { q } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [{ model: AssetCategory, as: 'category' }]
    });
    if (!asset) {
      req.flash('error', 'Asset not found');
      return res.redirect('/history');
    }
    const transactions = await AssetTransaction.findAll({
      where: { assetId: asset.id },
      include: [{ model: Employee, as: 'employee' }],
      order: [['actionDate', 'ASC'], ['id', 'ASC']]
    });
    res.render('history/view', { title: `History - ${asset.serialNumber}`, asset, transactions });
  } catch (err) {
    next(err);
  }
});

export default router;
