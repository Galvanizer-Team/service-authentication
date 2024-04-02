import "dotenv/config"
import { Sequelize } from "sequelize"
import config from "./config"

const nodeEnv = process.env.NODE_ENV || "development"
const { username: user, password, database: db, host, port } = config[nodeEnv]

const sequelize = new Sequelize(db, user, password, {
  host,
  port,
  dialect: "mysql",
  logging: false,
})

export default sequelize
