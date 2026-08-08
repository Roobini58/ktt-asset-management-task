import { validationResult } from 'express-validator';
import * as assetMovementService from '../services/assetMovement.service.js';

export const renderIssueForm = async (req, res, next) => {
  try {
    const { availableAssets, employees } = await assetMovementService.getIssueFormData();
    res.render('issue/form', {
      title: 'Issue Asset',
      availableAssets,
      employees,
      errors: []
    });
  } catch (err) {
    next(err);
  }
};

export const issueAsset = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const { availableAssets, employees } = await assetMovementService.getIssueFormData();
    return res.status(422).render('issue/form', {
      title: 'Issue Asset',
      availableAssets,
      employees,
      errors: errors.array()
    });
  }

  try {
    const result = await assetMovementService.issueAsset(
      req.body.assetId,
      req.body.employeeId,
      req.body.remarks
    );

    if (!result.success) {
      req.flash('error', result.message);
      return res.redirect('/issue');
    }

    req.flash('success', 'Asset issued successfully');
    res.redirect('/issue');
  } catch (err) {
    next(err);
  }
};
