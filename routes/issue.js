import express from 'express';
import { body, validationResult } from 'express-validator';
import { Asset, AssetCategory, Employee, AssetTransaction, sequelize } from '../models/index.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [availableAssets, employees] = await Promise.all([
      Asset.findAll({
        where: { status: 'IN_STOCK' },
        include: [{ model: AssetCategory, as: 'category' }],
        order: [['serialNumber', 'ASC']]
      }),
      Employee.findAll({ where: { isActive: true }, order: [['name', 'ASC']] })
    ]);
    res.render('issue/form', {
      title: 'Issue Asset',
      availableAssets,
      employees,
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
    body('employeeId').notEmpty().withMessage('Please select an employee')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const [availableAssets, employees] = await Promise.all([
        Asset.findAll({ where: { status: 'IN_STOCK' }, include: [{ model: AssetCategory, as: 'category' }] }),
        Employee.findAll({ where: { isActive: true } })
      ]);
      return res.status(422).render('issue/form', {
        title: 'Issue Asset',
        availableAssets,
        employees,
        errors: errors.array()
      });
    }

    const t = await sequelize.transaction();
    try {
      const asset = await Asset.findByPk(req.body.assetId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!asset || asset.status !== 'IN_STOCK') {
        await t.rollback();
        req.flash('error', 'Selected asset is not available for issue');
        return res.redirect('/issue');
      }

      await asset.update(
        { status: 'ISSUED', currentEmployeeId: req.body.employeeId },
        { transaction: t }
      );
      await AssetTransaction.create(
        {
          assetId: asset.id,
          employeeId: req.body.employeeId,
          action: 'ISSUED',
          remarks: req.body.remarks || null,
          actionDate: new Date()
        },
        { transaction: t }
      );
      await t.commit();
      req.flash('success', 'Asset issued successfully');
      res.redirect('/issue');
    } catch (err) {
      await t.rollback();
      next(err);
    }
  }
);

export default router;
