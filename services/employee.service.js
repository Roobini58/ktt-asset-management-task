import { Op } from 'sequelize';
import * as employeeRepository from '../repositories/employee.repository.js';

export const getEmployees = async (status = 'all', q = '') => {
  const where = {};

  if (status === 'active') where.isActive = true;
  if (status === 'inactive') where.isActive = false;

  if (q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { employeeCode: { [Op.iLike]: `%${q}%` } },
      { email: { [Op.iLike]: `%${q}%` } },
      { department: { [Op.iLike]: `%${q}%` } }
    ];
  }

  return await employeeRepository.findAll(where, [['name', 'ASC']]);
};

export const getEmployeeById = async (id, includeAssets = false) => {
  const options = includeAssets ? { include: [{ association: 'assetsHeld' }] } : {};
  return await employeeRepository.findByPk(id, options);
};

export const createEmployee = async (data) => {
  return await employeeRepository.create({
    employeeCode: data.employeeCode,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    department: data.department || null,
    designation: data.designation || null,
    branch: data.branch || null,
    isActive: data.isActive === 'on' || data.isActive === 'true' || data.isActive === true
  });
};

export const updateEmployee = async (id, data) => {
  const employee = await employeeRepository.findByPk(id);
  if (!employee) return null;

  return await employeeRepository.update(employee, {
    employeeCode: data.employeeCode,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    department: data.department || null,
    designation: data.designation || null,
    branch: data.branch || null,
    isActive: data.isActive === 'on' || data.isActive === 'true' || data.isActive === true
  });
};
