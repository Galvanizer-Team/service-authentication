/* eslint-disable lines-around-directive */
/* eslint-disable strict */
/* eslint-disable no-unused-vars */
"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "id", {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    })
  },
}
