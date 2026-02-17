'use strict';
/**
 * Liste les users avec isAdmin = 0 et isAdmin = 1.
 * Usage: cd user-backend && NODE_ENV=production node scripts/list-users-by-admin.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const { User, sequelize } = require('../models');

async function run() {
  try {
    await sequelize.authenticate();
    const admins = await User.findAll({
      where: { isAdmin: true },
      attributes: ['id', 'email', 'isAdmin', 'createdAt'],
      order: [['id', 'ASC']],
      raw: true
    });
    const nonAdmins = await User.findAll({
      where: { isAdmin: false },
      attributes: ['id', 'email', 'isAdmin', 'createdAt'],
      order: [['id', 'ASC']],
      raw: true
    });
    console.log('\n--- isAdmin = 1 ---');
    console.log(JSON.stringify(admins, null, 2));
    console.log('\n--- isAdmin = 0 ---');
    console.log(JSON.stringify(nonAdmins, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
