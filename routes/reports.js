import express from 'express';
import { Asset, AssetCategory, Employee } from '../models/index.js';

const router = express.Router();

// Full asset register including scrapped assets - the one place scrapped
// assets remain visible, per spec item 7.
router.get('/', async (req, res, next) => {
  try {
    const { status = 'all' } = req.query;
    const where = {};
    if (status !== 'all') where.status = status;

    const assets = await Asset.findAll({
      where,
      include: [
        { model: AssetCategory, as: 'category' },
        { model: Employee, as: 'currentEmployee' }
      ],
      order: [['created_at', 'DESC']]
    });

    const totalValue = assets.reduce((sum, a) => sum + parseFloat(a.purchaseValue), 0);

    res.render('reports/index', { title: 'Reports', assets, filters: { status }, totalValue });
  } catch (err) {
    next(err);
  }
});

export default router;
