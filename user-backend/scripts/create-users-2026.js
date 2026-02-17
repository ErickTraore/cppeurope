'use strict';
/**
 * Crée admin2026@cppeurope.net (isAdmin=1) et user2026@cppeurope.net (isAdmin=0).
 * Usage: cd user-backend && NODE_ENV=production DB_HOST=127.0.0.1 DB_PORT=3308 node scripts/create-users-2026.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const bcrypt = require('bcryptjs');
const { User, Profile, sequelize } = require('../models');

const USERS = [
  { email: 'admin2026@cppeurope.net', password: 'admin2026!', isAdmin: true },
  { email: 'user2026@cppeurope.net', password: 'user2026!', isAdmin: false },
];

const ROUNDS = 5;

async function run() {
  try {
    await sequelize.authenticate();
    for (const { email, password, isAdmin } of USERS) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        console.log('Déjà existant:', email);
        continue;
      }
      const hash = await bcrypt.hash(password, ROUNDS);
      const user = await User.create({ email, password: hash, isAdmin });
      await Profile.create({
        userId: user.id,
        email: user.email,
        lastName: null,
        firstName: null,
        phone1: null,
        phone2: null,
        phone3: null,
        address: null,
      });
      console.log('Créé:', email, 'isAdmin=', isAdmin);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
