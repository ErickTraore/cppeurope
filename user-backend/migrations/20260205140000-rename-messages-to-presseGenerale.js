'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Renommer la table Messages en PresseGenerales
    await queryInterface.renameTable('Messages', 'PresseGenerales');
  },

  down: async (queryInterface, Sequelize) => {
    // Revenir en arrière : renommer PresseGenerales en Messages
    await queryInterface.renameTable('PresseGenerales', 'Messages');
  }
};
