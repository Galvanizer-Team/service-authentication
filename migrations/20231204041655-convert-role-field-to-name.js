"use strict"

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the existing foreign key constraint
    await queryInterface.removeConstraint("Users", "Users_ibfk_1")

    // Change the 'role' column to type STRING
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.STRING,
      allowNull: false,
    })

    // Update existing records to set the role to 'User'
    await queryInterface.sequelize.query(`UPDATE "Users" SET role = 'User'`)

    // Optionally, add a new foreign key constraint if needed, referencing the 'name' column in 'Roles'
    // await queryInterface.addConstraint('Users', {
    //   fields: ['role'],
    //   type: 'foreign key',
    //   name: 'custom_fkey_constraint_name', // Choose a custom name for the constraint
    //   references: {
    //     table: 'Roles',
    //     field: 'name'
    //   },
    //   onDelete: 'cascade', // or 'set null', 'restrict', etc., based on your requirements
    //   onUpdate: 'cascade'
    // });
  },

  down: async (queryInterface, Sequelize) => {
    // Similar steps to revert changes, including removing and re-adding the original foreign key constraint
  },
}
