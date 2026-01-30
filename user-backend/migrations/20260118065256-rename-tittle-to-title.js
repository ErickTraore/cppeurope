'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Vérifier si la colonne existe avant de la renommer
    const [results] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM Messages LIKE 'tittle'`
    );
    if (results.length > 0) {
      await queryInterface.renameColumn('Messages', 'tittle', 'title');
    }
  },

  async down (queryInterface, Sequelize) {
    const [results] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM Messages LIKE 'title'`
    );
    if (results.length > 0) {
      await queryInterface.renameColumn('Messages', 'title', 'tittle');
    }
  }
};
