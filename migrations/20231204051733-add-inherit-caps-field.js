"use strict"

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Roles", "inheritFrom", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Roles", // same table
        key: "id", // primary key of Roles table
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Roles", "inheritFrom")
  },
}
