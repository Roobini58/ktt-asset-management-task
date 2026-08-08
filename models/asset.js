import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Asset extends Model {
    static associate(models) {
      Asset.belongsTo(models.AssetCategory, {
        foreignKey: 'categoryId',
        as: 'category'
      });
      Asset.belongsTo(models.Employee, {
        foreignKey: 'currentEmployeeId',
        as: 'currentEmployee'
      });
      Asset.hasMany(models.AssetTransaction, {
        foreignKey: 'assetId',
        as: 'transactions'
      });
    }
  }

  Asset.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      serialNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'serial_number'
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'category_id'
      },
      make: {
        type: DataTypes.STRING,
        allowNull: true
      },
      model: {
        type: DataTypes.STRING,
        allowNull: true
      },
      branch: {
        type: DataTypes.STRING,
        allowNull: true
      },
      purchaseDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'purchase_date'
      },
      purchaseValue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'purchase_value'
      },
      status: {
        type: DataTypes.ENUM('IN_STOCK', 'ISSUED', 'SCRAPPED'),
        allowNull: false,
        defaultValue: 'IN_STOCK'
      },
      currentEmployeeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'current_employee_id'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Asset',
      tableName: 'assets',
      underscored: true
    }
  );

  return Asset;
};
