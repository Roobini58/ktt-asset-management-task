import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      Employee.hasMany(models.Asset, {
        foreignKey: 'currentEmployeeId',
        as: 'assetsHeld'
      });
      Employee.hasMany(models.AssetTransaction, {
        foreignKey: 'employeeId',
        as: 'transactions'
      });
    }
  }

  Employee.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      employeeCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'employee_code'
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isEmail: true }
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true
      },
      designation: {
        type: DataTypes.STRING,
        allowNull: true
      },
      branch: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
      }
    },
    {
      sequelize,
      modelName: 'Employee',
      tableName: 'employees',
      underscored: true
    }
  );

  return Employee;
};
