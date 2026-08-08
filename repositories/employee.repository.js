import { Employee } from '../models/index.js';

export const findAll = async (where = {}, order = [['name', 'ASC']]) => {
  return await Employee.findAll({ where, order });
};

export const findByPk = async (id, options = {}) => {
  return await Employee.findByPk(id, options);
};

export const create = async (data, options = {}) => {
  return await Employee.create(data, options);
};

export const update = async (employee, data, options = {}) => {
  return await employee.update(data, options);
};

export const count = async (where = {}) => {
  return await Employee.count({ where });
};
