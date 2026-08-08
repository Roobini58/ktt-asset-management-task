import { validationResult } from 'express-validator';
import * as assetMovementService from '../services/assetMovement.service.js';

export const renderScrapForm = async (req, res, next) => {
  try {
    const { eligibleAssets } = await assetMovementService.getScrapFormData();
    res.render('scrap/form', { title: 'Scrap Asset', eligibleAssets, errors: [] });
  } catch (err) {
    next(err);
  }
};

export const scrapAsset = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const { eligibleAssets } = await assetMovementService.getScrapFormData();
    return res.status(422).render('scrap/form', {
      title: 'Scrap Asset',
      eligibleAssets,
      errors: errors.array()
    });
  }

  try {
    const result = await assetMovementService.scrapAsset(
      req.body.assetId,
      req.body.remarks,
      req.body.reason
    );

    if (!result.success) {
      req.flash('error', result.message);
      return res.redirect('/scrap');
    }

    req.flash('success', 'Asset marked as scrapped');
    res.redirect('/scrap');
  } catch (err) {
    next(err);
  }
};
