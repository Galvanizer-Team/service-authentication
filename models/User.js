import { DataTypes } from "sequelize"
import sequelize from "../config/database"

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    mfa: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    primaryAuth: {
      type: DataTypes.STRING,
      defaultValue: "UNPW",
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
    ],
  }
)

export default User
