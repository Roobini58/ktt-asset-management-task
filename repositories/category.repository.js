import { AssetCategory } from '../models/index.js';

export const findAll = async (order = [['name', 'ASC']]) => {
  return await AssetCategory.findAll({ order });
};

export const findByPk = async (id, options = {}) => {
  return await AssetCategory.findByPk(id, options);
};

export const create = async (data, options = {}) => {
  return await AssetCategory.create(data, options);
};

export const update = async (category, data, options = {}) => {
  return await category.update(data, options);
};

export const count = async (where = {}) => {
  return await AssetCategory.count({ where });
};
