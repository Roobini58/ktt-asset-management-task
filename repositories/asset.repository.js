import { Asset } from '../models/index.js';

export const findAll = async (options = {}) => {
  return await Asset.findAll(options);
};

export const findByPk = async (id, options = {}) => {
  return await Asset.findByPk(id, options);
};

export const create = async (data, options = {}) => {
  return await Asset.create(data, options);
};

export const update = async (asset, data, options = {}) => {
  return await asset.update(data, options);
};

export const count = async (where = {}) => {
  return await Asset.count({ where });
};
