import { DataTypes } from "sequelize"
import sequelize from "../config/database"

const Token = sequelize.define("Token", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  token: {
    type: DataTypes.STRING(1000),
    allowNull: false,
  },
  expires: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  blacklisted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
})

export default Token
