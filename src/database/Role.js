import { DataTypes } from "sequelize"
import sequelize from "./database"

export const Role = sequelize.define("Role", {
  id: {
    type: DataTypes.INTEGER, // or DataTypes.UUID
    primaryKey: true,
    autoIncrement: true, // set to false if using UUID
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  capabilities: {
    type: DataTypes.JSON,
    allowNull: true,
  },
})
