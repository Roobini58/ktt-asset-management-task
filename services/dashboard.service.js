import * as assetRepository from '../repositories/asset.repository.js';
import * as employeeRepository from '../repositories/employee.repository.js';
import * as categoryRepository from '../repositories/category.repository.js';

export const getDashboardStats = async () => {
  const [totalAssets, inStock, issued, scrapped, totalEmployees, totalCategories] = await Promise.all([
    assetRepository.count(),
    assetRepository.count({ status: 'IN_STOCK' }),
    assetRepository.count({ status: 'ISSUED' }),
    assetRepository.count({ status: 'SCRAPPED' }),
    employeeRepository.count({ isActive: true }),
    categoryRepository.count()
  ]);

  return {
    totalAssets,
    inStock,
    issued,
    scrapped,
    totalEmployees,
    totalCategories
  };
};
