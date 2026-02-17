'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const { PresseGle, sequelize } = require('../models');

async function run() {
  try {
    await sequelize.authenticate();
    const deleted = await PresseGle.destroy({ where: {} });
    console.log('PresseGle vidée :', deleted, 'ligne(s) supprimée(s).');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
