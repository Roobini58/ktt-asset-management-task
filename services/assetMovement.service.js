import { Op } from 'sequelize';
import { AssetCategory, Employee, sequelize } from '../models/index.js';
import * as assetRepository from '../repositories/asset.repository.js';
import * as employeeRepository from '../repositories/employee.repository.js';
import * as transactionRepository from '../repositories/transaction.repository.js';

export const RETURN_REASONS = ['Upgrade', 'Repair', 'Resignation', 'Other'];

export const getIssueFormData = async () => {
  const [availableAssets, employees] = await Promise.all([
    assetRepository.findAll({
      where: { status: 'IN_STOCK' },
      include: [{ model: AssetCategory, as: 'category' }],
      order: [['serialNumber', 'ASC']]
    }),
    employeeRepository.findAll({ isActive: true }, [['name', 'ASC']])
  ]);

  return { availableAssets, employees };
};

export const issueAsset = async (assetId, employeeId, remarks) => {
  const t = await sequelize.transaction();
  try {
    const asset = await assetRepository.findByPk(assetId, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!asset || asset.status !== 'IN_STOCK') {
      await t.rollback();
      return { success: false, message: 'Selected asset is not available for issue' };
    }

    await assetRepository.update(
      asset,
      { status: 'ISSUED', currentEmployeeId: employeeId },
      { transaction: t }
    );

    await transactionRepository.create(
      {
        assetId: asset.id,
        employeeId: employeeId,
        action: 'ISSUED',
        remarks: remarks || null,
        actionDate: new Date()
      },
      { transaction: t }
    );

    await t.commit();
    return { success: true };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

export const getReturnFormData = async () => {
  const issuedAssets = await assetRepository.findAll({
    where: { status: 'ISSUED' },
    include: [
      { model: AssetCategory, as: 'category' },
      { model: Employee, as: 'currentEmployee' }
    ],
    order: [['serialNumber', 'ASC']]
  });

  return { issuedAssets, reasons: RETURN_REASONS };
};

export const returnAsset = async (assetId, reason, remarks) => {
  const t = await sequelize.transaction();
  try {
    const asset = await assetRepository.findByPk(assetId, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!asset || asset.status !== 'ISSUED') {
      await t.rollback();
      return { success: false, message: 'Selected asset is not currently issued' };
    }

    const previousEmployeeId = asset.currentEmployeeId;

    await assetRepository.update(
      asset,
      { status: 'IN_STOCK', currentEmployeeId: null },
      { transaction: t }
    );

    await transactionRepository.create(
      {
        assetId: asset.id,
        employeeId: previousEmployeeId,
        action: 'RETURNED',
        reason: reason,
        remarks: remarks || null,
        actionDate: new Date()
      },
      { transaction: t }
    );

    await t.commit();
    return { success: true };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

export const getScrapFormData = async () => {
  const eligibleAssets = await assetRepository.findAll({
    where: { status: { [Op.ne]: 'SCRAPPED' } },
    include: [
      { model: AssetCategory, as: 'category' },
      { model: Employee, as: 'currentEmployee' }
    ],
    order: [['serialNumber', 'ASC']]
  });

  return { eligibleAssets };
};

export const scrapAsset = async (assetId, remarks, reason) => {
  const t = await sequelize.transaction();
  try {
    const asset = await assetRepository.findByPk(assetId, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!asset || asset.status === 'SCRAPPED') {
      await t.rollback();
      return { success: false, message: 'Selected asset is already scrapped or does not exist' };
    }

    const previousEmployeeId = asset.currentEmployeeId;

    await assetRepository.update(
      asset,
      { status: 'SCRAPPED', currentEmployeeId: null },
      { transaction: t }
    );

    await transactionRepository.create(
      {
        assetId: asset.id,
        employeeId: previousEmployeeId,
        action: 'SCRAPPED',
        reason: reason || null,
        remarks: remarks,
        actionDate: new Date()
      },
      { transaction: t }
    );

    await t.commit();
    return { success: true };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};
