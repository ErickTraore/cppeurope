'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hasTable = async (name) => {
      const [results] = await queryInterface.sequelize.query(
        `SHOW TABLES LIKE '${name}'`
      );
      return Array.isArray(results) && results.length > 0;
    };

    if (await hasTable('Messages')) {
      await queryInterface.renameTable('Messages', 'PresseGle');
    } else if (await hasTable('PresseGenerales')) {
      await queryInterface.renameTable('PresseGenerales', 'PresseGle');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const hasTable = async (name) => {
      const [results] = await queryInterface.sequelize.query(
        `SHOW TABLES LIKE '${name}'`
      );
      return Array.isArray(results) && results.length > 0;
    };

    if (await hasTable('PresseGle')) {
      await queryInterface.renameTable('PresseGle', 'Messages');
    }
  }
};
