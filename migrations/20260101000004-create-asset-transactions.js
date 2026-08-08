export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('asset_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      asset_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'assets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.ENUM('PURCHASED', 'ISSUED', 'RETURNED', 'SCRAPPED'),
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      action_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('asset_transactions', ['asset_id']);
    await queryInterface.addIndex('asset_transactions', ['employee_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('asset_transactions');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_asset_transactions_action";');
  }
};
