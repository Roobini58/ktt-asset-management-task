import express from 'express';
import { Asset, AssetCategory } from '../models/index.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const assets = await Asset.findAll({
      where: { status: 'IN_STOCK' },
      include: [{ model: AssetCategory, as: 'category' }],
      order: [['branch', 'ASC'], ['category', 'name', 'ASC']]
    });

    // Group by branch, compute per-branch totals + count, and grand total
    const branches = {};
    let grandTotalValue = 0;
    let grandTotalCount = 0;

    assets.forEach((asset) => {
      const branch = asset.branch || 'Unassigned';
      if (!branches[branch]) {
        branches[branch] = { branch, assets: [], count: 0, totalValue: 0 };
      }
      branches[branch].assets.push(asset);
      branches[branch].count += 1;
      branches[branch].totalValue += parseFloat(asset.purchaseValue);
      grandTotalCount += 1;
      grandTotalValue += parseFloat(asset.purchaseValue);
    });

    res.render('stock/view', {
      title: 'Stock View',
      branches: Object.values(branches),
      grandTotalValue,
      grandTotalCount
    });
  } catch (err) {
    next(err);
  }
});

export default router;
