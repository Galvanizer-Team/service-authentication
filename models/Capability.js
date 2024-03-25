import { DataTypes } from "sequelize"
import sequelize from "../config/database"

const Capability = sequelize.define("Capability", {
  id: {
    type: DataTypes.INTEGER, // or DataTypes.UUID
    primaryKey: true,
    autoIncrement: true, // set to false if using UUID
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
})

export default Capability
