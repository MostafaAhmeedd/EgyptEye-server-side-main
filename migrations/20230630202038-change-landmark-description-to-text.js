'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change the data type of the description column to TEXT
    await queryInterface.changeColumn('landmarks', 'description', {
      type: Sequelize.TEXT,
      allowNull: true, // Update this based on your requirements
    });
  },

  down: async (queryInterface, Sequelize) => {
    // If needed, you can define a rollback logic here
    // For reverting the changes made in the up function
  }
};
