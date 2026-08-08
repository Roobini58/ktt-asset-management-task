import * as assetService from '../services/asset.service.js';

export const searchHistory = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const assets = await assetService.getHistoryList(q);
    res.render('history/search', { title: 'Asset History', assets, filters: { q } });
  } catch (err) {
    next(err);
  }
};

export const viewAssetHistory = async (req, res, next) => {
  try {
    const historyData = await assetService.getAssetHistory(req.params.id);
    if (!historyData) {
      req.flash('error', 'Asset not found');
      return res.redirect('/history');
    }
    res.render('history/view', {
      title: `History - ${historyData.asset.serialNumber}`,
      asset: historyData.asset,
      transactions: historyData.transactions
    });
  } catch (err) {
    next(err);
  }
};
