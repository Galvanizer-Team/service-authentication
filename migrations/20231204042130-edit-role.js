"use strict"

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add a unique index to the 'name' column in the 'Roles' table
    await queryInterface.addIndex("Roles", {
      fields: ["name"],
      unique: true,
      name: "roles_name_unique",
    })

    // Allow 'role' field to be null in the 'Users' table
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.STRING,
      allowNull: true,
    })

    // Add a foreign key constraint from 'Users' table to 'Roles' table
    await queryInterface.addConstraint("Users", {
      fields: ["role"],
      type: "foreign key",
      name: "user_role_fk",
      references: {
        table: "Roles",
        field: "name",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    })
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the foreign key constraint
    await queryInterface.removeConstraint("Users", "user_role_fk")

    // Revert the 'role' field to not allow nulls (adjust as per your original setup)
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.STRING,
      allowNull: false,
    })

    // Remove the unique index from the 'Roles' table
    await queryInterface.removeIndex("Roles", "roles_name_unique")

    // If you had an original foreign key setup, re-add it here
  },
}
