import * as assetService from '../services/asset.service.js';

export const viewReports = async (req, res, next) => {
  try {
    const { status = 'all' } = req.query;
    const { assets, totalValue } = await assetService.getRegisterReport(status);
    res.render('reports/index', { title: 'Reports', assets, filters: { status }, totalValue });
  } catch (err) {
    next(err);
  }
};
