import { DataTypes } from "sequelize"
import sequelize from "../config/database"

const RoleCapability = sequelize.define("Role_Capability", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
})

export default RoleCapability
