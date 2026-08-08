import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class AssetCategory extends Model {
    static associate(models) {
      AssetCategory.hasMany(models.Asset, {
        foreignKey: 'categoryId',
        as: 'assets'
      });
    }
  }

  AssetCategory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'AssetCategory',
      tableName: 'asset_categories',
      underscored: true
    }
  );

  return AssetCategory;
};
