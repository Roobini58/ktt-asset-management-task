import express from 'express';
import { Op } from 'sequelize';
import { body, validationResult } from 'express-validator';
import { Asset, AssetCategory, Employee, AssetTransaction, sequelize } from '../models/index.js';

const router = express.Router();

// Any non-scrapped asset (in stock or issued) can be marked obsolete.
router.get('/', async (req, res, next) => {
  try {
    const eligibleAssets = await Asset.findAll({
      where: { status: { [Op.ne]: 'SCRAPPED' } },
      include: [
        { model: AssetCategory, as: 'category' },
        { model: Employee, as: 'currentEmployee' }
      ],
      order: [['serialNumber', 'ASC']]
    });
    res.render('scrap/form', { title: 'Scrap Asset', eligibleAssets, errors: [] });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  [
    body('assetId').notEmpty().withMessage('Please select an asset'),
    body('remarks').trim().notEmpty().withMessage('Please provide a reason for scrapping')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const eligibleAssets = await Asset.findAll({
        where: { status: { [Op.ne]: 'SCRAPPED' } },
        include: [{ model: AssetCategory, as: 'category' }, { model: Employee, as: 'currentEmployee' }]
      });
      return res.status(422).render('scrap/form', {
        title: 'Scrap Asset',
        eligibleAssets,
        errors: errors.array()
      });
    }

    const t = await sequelize.transaction();
    try {
      const asset = await Asset.findByPk(req.body.assetId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!asset || asset.status === 'SCRAPPED') {
        await t.rollback();
        req.flash('error', 'Selected asset is already scrapped or does not exist');
        return res.redirect('/scrap');
      }

      const previousEmployeeId = asset.currentEmployeeId;

      await asset.update(
        { status: 'SCRAPPED', currentEmployeeId: null },
        { transaction: t }
      );
      await AssetTransaction.create(
        {
          assetId: asset.id,
          employeeId: previousEmployeeId,
          action: 'SCRAPPED',
          reason: req.body.reason || null,
          remarks: req.body.remarks,
          actionDate: new Date()
        },
        { transaction: t }
      );
      await t.commit();
      req.flash('success', 'Asset marked as scrapped');
      res.redirect('/scrap');
    } catch (err) {
      await t.rollback();
      next(err);
    }
  }
);

export default router;
