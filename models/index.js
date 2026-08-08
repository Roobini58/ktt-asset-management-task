import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import process from 'process';
import dbConfigs from '../config/config.js';
import assetModel from './asset.js';
import assetCategoryModel from './assetcategory.js';
import assetTransactionModel from './assettransaction.js';
import employeeModel from './employee.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const env = process.env.NODE_ENV || 'development';
const config = dbConfigs[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const modelFactories = [
  assetModel,
  assetCategoryModel,
  assetTransactionModel,
  employeeModel
];

modelFactories.forEach((factory) => {
  const model = factory(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

const { Asset, AssetCategory, AssetTransaction, Employee } = db;

export { db as default, sequelize, Sequelize, Asset, AssetCategory, AssetTransaction, Employee };
