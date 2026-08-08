import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class AssetTransaction extends Model {
    static associate(models) {
      AssetTransaction.belongsTo(models.Asset, {
        foreignKey: 'assetId',
        as: 'asset'
      });
      AssetTransaction.belongsTo(models.Employee, {
        foreignKey: 'employeeId',
        as: 'employee'
      });
    }
  }

  AssetTransaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      assetId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'asset_id'
      },
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'employee_id'
      },
      action: {
        type: DataTypes.ENUM('PURCHASED', 'ISSUED', 'RETURNED', 'SCRAPPED'),
        allowNull: false
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      actionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'action_date'
      }
    },
    {
      sequelize,
      modelName: 'AssetTransaction',
      tableName: 'asset_transactions',
      underscored: true,
      updatedAt: false
    }
  );

  return AssetTransaction;
};
