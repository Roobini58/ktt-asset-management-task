import * as assetService from '../services/asset.service.js';

export const viewStock = async (req, res, next) => {
  try {
    const { branches, grandTotalValue, grandTotalCount } = await assetService.getStockReport();
    res.render('stock/view', {
      title: 'Stock View',
      branches,
      grandTotalValue,
      grandTotalCount
    });
  } catch (err) {
    next(err);
  }
};
