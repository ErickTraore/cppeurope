'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Supprimer la colonne tittle (doublon avec faute de frappe)
    // La colonne title existe déjà avec les bonnes données
    try {
      await queryInterface.removeColumn('Messages', 'tittle');
      console.log('✅ Colonne tittle supprimée');
    } catch (error) {
      console.log('⚠️ Colonne tittle déjà supprimée ou n\'existe pas');
    }
  },

  async down (queryInterface, Sequelize) {
    // Rollback : recréer tittle (au cas où, bien que ce soit un doublon)
    try {
      await queryInterface.addColumn('Messages', 'tittle', {
        type: Sequelize.STRING(500),
        allowNull: true
      });
    } catch (error) {
      console.log('⚠️ Impossible de recréer tittle');
    }
  }
};
