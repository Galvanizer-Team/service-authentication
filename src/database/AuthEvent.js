import { DataTypes } from "sequelize"
import sequelize from "./database"

export const AuthEvent = sequelize.define("AuthEvent", {
  id: {
    type: DataTypes.INTEGER, // or DataTypes.UUID
    primaryKey: true,
    autoIncrement: true, // set to false if using UUID
  },
  user_id: {
    type: DataTypes.INTEGER, // or DataTypes.UUID
    allowNull: false,
    references: {
      model: "Users", // This should match the table name of your Users model
      key: "id",
    },
  },
  event_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true,
  },
})
