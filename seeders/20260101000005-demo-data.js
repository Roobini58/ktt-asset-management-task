import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('asset_categories', [
      { name: 'Laptop', description: 'Laptops and notebooks', created_at: now, updated_at: now },
      { name: 'Mobile Phone', description: 'Company mobile phones', created_at: now, updated_at: now },
      { name: 'Modem', description: 'Internet modems / dongles', created_at: now, updated_at: now },
      { name: 'Screw Driver', description: 'Hand tools - screw drivers', created_at: now, updated_at: now },
      { name: 'Drill Machine', description: 'Power tools - drill machines', created_at: now, updated_at: now }
    ]);

    await queryInterface.bulkInsert('employees', [
      { employee_code: 'EMP001', name: 'Arjun Kumar', email: 'arjun.kumar@example.com', phone: '9000000001', department: 'Engineering', designation: 'Field Technician', branch: 'Coimbatore', is_active: true, created_at: now, updated_at: now },
      { employee_code: 'EMP002', name: 'Priya Raman', email: 'priya.raman@example.com', phone: '9000000002', department: 'Operations', designation: 'Supervisor', branch: 'Chennai', is_active: true, created_at: now, updated_at: now },
      { employee_code: 'EMP003', name: 'Suresh Babu', email: 'suresh.babu@example.com', phone: '9000000003', department: 'Engineering', designation: 'Field Technician', branch: 'Bengaluru', is_active: false, created_at: now, updated_at: now }
    ]);

    const categories = await queryInterface.sequelize.query(
      'SELECT id, name FROM asset_categories;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const catId = (name) => categories.find((c) => c.name === name).id;

    const assets = [
      { id: uuidv4(), serial_number: 'LT-SN-1001', category_id: catId('Laptop'), make: 'Dell', model: 'Latitude 5420', branch: 'Coimbatore', purchase_date: '2024-01-15', purchase_value: 65000, status: 'IN_STOCK', current_employee_id: null, created_at: now, updated_at: now },
      { id: uuidv4(), serial_number: 'LT-SN-1002', category_id: catId('Laptop'), make: 'HP', model: 'ProBook 440', branch: 'Chennai', purchase_date: '2024-02-10', purchase_value: 58000, status: 'IN_STOCK', current_employee_id: null, created_at: now, updated_at: now },
      { id: uuidv4(), serial_number: 'MP-SN-2001', category_id: catId('Mobile Phone'), make: 'Samsung', model: 'Galaxy A54', branch: 'Coimbatore', purchase_date: '2024-03-05', purchase_value: 28000, status: 'IN_STOCK', current_employee_id: null, created_at: now, updated_at: now },
      { id: uuidv4(), serial_number: 'MD-SN-3001', category_id: catId('Modem'), make: 'TP-Link', model: 'MR6400', branch: 'Bengaluru', purchase_date: '2023-11-20', purchase_value: 4500, status: 'IN_STOCK', current_employee_id: null, created_at: now, updated_at: now },
      { id: uuidv4(), serial_number: 'DR-SN-4001', category_id: catId('Drill Machine'), make: 'Bosch', model: 'GSB 500', branch: 'Coimbatore', purchase_date: '2023-08-01', purchase_value: 5200, status: 'SCRAPPED', current_employee_id: null, created_at: now, updated_at: now }
    ];

    await queryInterface.bulkInsert('assets', assets);

    const emp = await queryInterface.sequelize.query(
      "SELECT id FROM employees WHERE employee_code = 'EMP001';",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const empId = emp[0].id;

    // Give one asset an issued history to demonstrate the flow
    const laptop2 = assets[1];
    await queryInterface.bulkUpdate(
      'assets',
      { status: 'ISSUED', current_employee_id: empId, updated_at: now },
      { id: laptop2.id }
    );

    const txns = assets.map((a) => ({
      asset_id: a.id,
      employee_id: null,
      action: 'PURCHASED',
      reason: null,
      remarks: 'Initial stock entry',
      action_date: a.purchase_date,
      created_at: now
    }));
    txns.push({
      asset_id: laptop2.id,
      employee_id: empId,
      action: 'ISSUED',
      reason: null,
      remarks: 'Issued at onboarding',
      action_date: now,
      created_at: now
    });
    const scrapAsset = assets[4];
    txns.push({
      asset_id: scrapAsset.id,
      employee_id: null,
      action: 'SCRAPPED',
      reason: 'Beyond repair',
      remarks: 'Motor burnt out',
      action_date: now,
      created_at: now
    });

    await queryInterface.bulkInsert('asset_transactions', txns);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('asset_transactions', null, {});
    await queryInterface.bulkDelete('assets', null, {});
    await queryInterface.bulkDelete('employees', null, {});
    await queryInterface.bulkDelete('asset_categories', null, {});
  }
};
