import { AssetTransaction, Employee } from '../models/index.js';

export const create = async (data, options = {}) => {
  return await AssetTransaction.create(data, options);
};

export const findAllByAssetId = async (assetId) => {
  return await AssetTransaction.findAll({
    where: { assetId },
    include: [{ model: Employee, as: 'employee' }],
    order: [['actionDate', 'ASC'], ['id', 'ASC']]
  });
};
