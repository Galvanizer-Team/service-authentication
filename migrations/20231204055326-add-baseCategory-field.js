"use strict"

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Roles", "baseCapabilities", {
      type: Sequelize.JSON,
      allowNull: true, // allows null if you want the field to be optional
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Roles", "baseCapabilities")
  },
}
