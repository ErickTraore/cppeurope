'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Supprimer la colonne 'tittle' qui est un doublon avec la faute
    const [results] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM Messages LIKE 'tittle'`
    );
    
    if (results.length > 0) {
      console.log('Suppression de la colonne tittle (doublon avec faute de frappe)');
      await queryInterface.removeColumn('Messages', 'tittle');
    } else {
      console.log('Colonne tittle n\'existe pas, rien à supprimer');
    }
  },

  async down (queryInterface, Sequelize) {
    // Rollback : recréer la colonne tittle (au cas où)
    const [results] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM Messages LIKE 'tittle'`
    );
    
    if (results.length === 0) {
      await queryInterface.addColumn('Messages', 'tittle', {
        type: Sequelize.STRING(500),
        allowNull: true
      });
    }
  }
};
