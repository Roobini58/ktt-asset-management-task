import express from 'express';
import { body, validationResult } from 'express-validator';
import { Asset, AssetCategory, Employee, AssetTransaction, sequelize } from '../models/index.js';

const router = express.Router();

const RETURN_REASONS = ['Upgrade', 'Repair', 'Resignation', 'Other'];

router.get('/', async (req, res, next) => {
  try {
    const issuedAssets = await Asset.findAll({
      where: { status: 'ISSUED' },
      include: [
        { model: AssetCategory, as: 'category' },
        { model: Employee, as: 'currentEmployee' }
      ],
      order: [['serialNumber', 'ASC']]
    });
    res.render('return/form', {
      title: 'Return Asset',
      issuedAssets,
      reasons: RETURN_REASONS,
      errors: []
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  [
    body('assetId').notEmpty().withMessage('Please select an asset'),
    body('reason').notEmpty().withMessage('Please select a return reason')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const issuedAssets = await Asset.findAll({
        where: { status: 'ISSUED' },
        include: [{ model: AssetCategory, as: 'category' }, { model: Employee, as: 'currentEmployee' }]
      });
      return res.status(422).render('return/form', {
        title: 'Return Asset',
        issuedAssets,
        reasons: RETURN_REASONS,
        errors: errors.array()
      });
    }

    const t = await sequelize.transaction();
    try {
      const asset = await Asset.findByPk(req.body.assetId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!asset || asset.status !== 'ISSUED') {
        await t.rollback();
        req.flash('error', 'Selected asset is not currently issued');
        return res.redirect('/return');
      }

      const previousEmployeeId = asset.currentEmployeeId;

      await asset.update(
        { status: 'IN_STOCK', currentEmployeeId: null },
        { transaction: t }
      );
      await AssetTransaction.create(
        {
          assetId: asset.id,
          employeeId: previousEmployeeId,
          action: 'RETURNED',
          reason: req.body.reason,
          remarks: req.body.remarks || null,
          actionDate: new Date()
        },
        { transaction: t }
      );
      await t.commit();
      req.flash('success', 'Asset returned successfully');
      res.redirect('/return');
    } catch (err) {
      await t.rollback();
      next(err);
    }
  }
);

export default router;
