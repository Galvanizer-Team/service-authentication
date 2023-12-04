import { DataTypes } from "sequelize"
import sequelize from "./database"

export const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Roles",
      key: "name",
    },
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
})
