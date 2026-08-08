import { validationResult } from 'express-validator';
import * as assetMovementService from '../services/assetMovement.service.js';

export const renderReturnForm = async (req, res, next) => {
  try {
    const { issuedAssets, reasons } = await assetMovementService.getReturnFormData();
    res.render('return/form', {
      title: 'Return Asset',
      issuedAssets,
      reasons,
      errors: []
    });
  } catch (err) {
    next(err);
  }
};

export const returnAsset = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const { issuedAssets, reasons } = await assetMovementService.getReturnFormData();
    return res.status(422).render('return/form', {
      title: 'Return Asset',
      issuedAssets,
      reasons,
      errors: errors.array()
    });
  }

  try {
    const result = await assetMovementService.returnAsset(
      req.body.assetId,
      req.body.reason,
      req.body.remarks
    );

    if (!result.success) {
      req.flash('error', result.message);
      return res.redirect('/return');
    }

    req.flash('success', 'Asset returned successfully');
    res.redirect('/return');
  } catch (err) {
    next(err);
  }
};
