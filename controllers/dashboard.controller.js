import * as dashboardService from '../services/dashboard.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.render('index', {
      title: 'Dashboard',
      stats
    });
  } catch (err) {
    next(err);
  }
};
