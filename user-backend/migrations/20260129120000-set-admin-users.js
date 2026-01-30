'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate('Users', 
      { isAdmin: true },
      {
        email: {
          [Sequelize.Op.in]: [
            'kohoubigohifranck@gmail.com',
            'edjamannanou@aol.com'
          ]
        }
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate('Users', 
      { isAdmin: false },
      {
        email: {
          [Sequelize.Op.in]: [
            'kohoubigohifranck@gmail.com',
            'edjamannanou@aol.com'
          ]
        }
      }
    );
  }
};
