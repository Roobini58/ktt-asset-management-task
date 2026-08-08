export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('assets', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      serial_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'asset_categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      make: {
        type: Sequelize.STRING,
        allowNull: true
      },
      model: {
        type: Sequelize.STRING,
        allowNull: true
      },
      branch: {
        type: Sequelize.STRING,
        allowNull: true
      },
      purchase_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      purchase_value: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('IN_STOCK', 'ISSUED', 'SCRAPPED'),
        allowNull: false,
        defaultValue: 'IN_STOCK'
      },
      current_employee_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('assets', ['status']);
    await queryInterface.addIndex('assets', ['category_id']);
    await queryInterface.addIndex('assets', ['branch']);
    await queryInterface.addIndex('assets', ['make', 'model']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('assets');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assets_status";');
  }
};
