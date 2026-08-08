import { Op } from 'sequelize';
import { AssetCategory, Employee, sequelize } from '../models/index.js';
import * as assetRepository from '../repositories/asset.repository.js';
import * as transactionRepository from '../repositories/transaction.repository.js';
import * as categoryRepository from '../repositories/category.repository.js';

export const getAssetMasterList = async (categoryId = '', q = '') => {
  const where = { status: { [Op.ne]: 'SCRAPPED' } };

  if (categoryId) where.categoryId = categoryId;
  if (q) {
    where[Op.or] = [
      { serialNumber: { [Op.iLike]: `%${q}%` } },
      { make: { [Op.iLike]: `%${q}%` } },
      { model: { [Op.iLike]: `%${q}%` } }
    ];
  }

  const [assets, categories] = await Promise.all([
    assetRepository.findAll({
      where,
      include: [
        { model: AssetCategory, as: 'category' },
        { model: Employee, as: 'currentEmployee' }
      ],
      order: [['created_at', 'DESC']]
    }),
    categoryRepository.findAll([['name', 'ASC']])
  ]);

  return { assets, categories };
};

export const getAssetById = async (id) => {
  return await assetRepository.findByPk(id);
};

export const getAssetDetails = async (id) => {
  return await assetRepository.findByPk(id, {
    include: [
      { model: AssetCategory, as: 'category' },
      { model: Employee, as: 'currentEmployee' }
    ]
  });
};

export const createAssetWithTransaction = async (data) => {
  const t = await sequelize.transaction();
  try {
    const asset = await assetRepository.create(
      {
        serialNumber: data.serialNumber,
        categoryId: data.categoryId,
        make: data.make || null,
        model: data.model || null,
        branch: data.branch || null,
        purchaseDate: data.purchaseDate || null,
        purchaseValue: data.purchaseValue || 0,
        notes: data.notes || null,
        status: 'IN_STOCK'
      },
      { transaction: t }
    );

    await transactionRepository.create(
      {
        assetId: asset.id,
        action: 'PURCHASED',
        remarks: 'Asset added to inventory',
        actionDate: data.purchaseDate || new Date()
      },
      { transaction: t }
    );

    await t.commit();
    return asset;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

export const updateAsset = async (id, data) => {
  const asset = await assetRepository.findByPk(id);
  if (!asset) return null;

  return await assetRepository.update(asset, {
    serialNumber: data.serialNumber,
    categoryId: data.categoryId,
    make: data.make || null,
    model: data.model || null,
    branch: data.branch || null,
    purchaseDate: data.purchaseDate || null,
    purchaseValue: data.purchaseValue || 0,
    notes: data.notes || null
  });
};

export const getStockReport = async () => {
  const assets = await assetRepository.findAll({
    where: { status: 'IN_STOCK' },
    include: [{ model: AssetCategory, as: 'category' }],
    order: [['branch', 'ASC'], ['category', 'name', 'ASC']]
  });

  const branches = {};
  let grandTotalValue = 0;
  let grandTotalCount = 0;

  assets.forEach((asset) => {
    const branch = asset.branch || 'Unassigned';
    if (!branches[branch]) {
      branches[branch] = { branch, assets: [], count: 0, totalValue: 0 };
    }
    branches[branch].assets.push(asset);
    branches[branch].count += 1;
    branches[branch].totalValue += parseFloat(asset.purchaseValue);
    grandTotalCount += 1;
    grandTotalValue += parseFloat(asset.purchaseValue);
  });

  return {
    branches: Object.values(branches),
    grandTotalValue,
    grandTotalCount
  };
};

export const getHistoryList = async (q = '') => {
  const where = {};
  if (q) {
    where[Op.or] = [
      { serialNumber: { [Op.iLike]: `%${q}%` } },
      { make: { [Op.iLike]: `%${q}%` } },
      { model: { [Op.iLike]: `%${q}%` } }
    ];
  }
  return await assetRepository.findAll({
    where,
    include: [{ model: AssetCategory, as: 'category' }],
    order: [['serialNumber', 'ASC']]
  });
};

export const getAssetHistory = async (assetId) => {
  const asset = await assetRepository.findByPk(assetId, {
    include: [{ model: AssetCategory, as: 'category' }]
  });

  if (!asset) return null;

  const transactions = await transactionRepository.findAllByAssetId(asset.id);
  return { asset, transactions };
};

export const getRegisterReport = async (status = 'all') => {
  const where = {};
  if (status !== 'all') where.status = status;

  const assets = await assetRepository.findAll({
    where,
    include: [
      { model: AssetCategory, as: 'category' },
      { model: Employee, as: 'currentEmployee' }
    ],
    order: [['created_at', 'DESC']]
  });

  const totalValue = assets.reduce((sum, a) => sum + parseFloat(a.purchaseValue), 0);

  return { assets, totalValue };
};
