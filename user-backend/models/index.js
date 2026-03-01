// File : user-backend/models/index.js
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

console.log("📂 Chargement de models/index.js...");

const env = process.env.NODE_ENV || 'development';
console.log(`🌍 Environnement détecté : ${env}`);

const configPath = path.join(__dirname, '..', 'config', 'config.js');
const config = require(configPath)[env];
console.log("⚙️ Configuration Sequelize chargée :", config);

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host || 'mariadb',         // ✅ host par défaut = service Docker
  port: config.port || 3306,              // ✅ port explicite
  dialect: config.dialect || 'mariadb',   // ✅ dialect cohérent
  logging: false,
});

console.log(`🔌 Initialisation Sequelize pour la base : ${config.database}`);

// Import des modèles
const User = require('./user')(sequelize, DataTypes);
const Profile = require('./profile')(sequelize, DataTypes);

// Associations (comme tu l’avais)
if (User.associate) User.associate({ Profile });
if (Profile.associate) Profile.associate({ User });

module.exports = {
  sequelize,
  User,
  Profile,
};