import { DataTypes } from "sequelize"
import sequelize from "../config/database"

// storing information used in 2-factor authentication (2FA)
const AuthFactor = sequelize.define("AuthFactor", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  factor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  secret: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
})

export default AuthFactor
