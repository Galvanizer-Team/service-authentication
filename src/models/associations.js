import User from "./User"
import Role from "./Role"
import Capability from "./Capability"
import AuthFactor from "./AuthFactor"

User.belongsTo(Role, { foreignKey: "roleId" })
Role.hasMany(User, { foreignKey: "roleId" })

User.hasMany(AuthFactor, { foreignKey: "userId" })
AuthFactor.belongsTo(User, { foreignKey: "userId" })

Role.belongsToMany(Capability, { through: "Role_Capability", as: "capabilities" })
Capability.belongsToMany(Role, { through: "Role_Capability", as: "roles" })

Role.addScope(
  "defaultScope",
  {
    include: [
      {
        model: Capability,
        as: "capabilities",
        attributes: ["id", "name", "description"],
        through: {
          attributes: [],
        },
      },
    ],
  },
  { override: true }
)

User.addScope(
  "defaultScope",
  {
    include: [
      {
        model: Role,
        attributes: ["name", "description"],
        include: [
          {
            model: Capability,
            as: "capabilities",
            attributes: ["name", "description"],
            through: {
              attributes: [],
            },
          },
        ],
      },
      {
        model: AuthFactor,
        attributes: ["factor", "verified", "verifiedAt"],
      },
    ],
  },
  { override: true }
)
