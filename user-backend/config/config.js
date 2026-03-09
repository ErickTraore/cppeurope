// user-backend/config/config.js
const path = require('path');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '.env.production' : `.env.${env}`;
dotenv.config({ path: path.join(__dirname, '..', envFile) });

module.exports = {
  development: {
    database: process.env.DB_NAME_USER_DEV,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST, // force localhost
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql'
  },
  test: {
    database: process.env.DB_NAME_USER_TEST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST, // force localhost
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql'
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || 'mariadb',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mariadb',
    logging: false,

  }
};
