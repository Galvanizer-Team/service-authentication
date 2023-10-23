import { Sequelize } from "sequelize"

const db = process.env.DB_NAME
const user = process.env.DB_USER
const password = process.env.DB_PASS
const host = process.env.DB_HOST
const port = process.env.DB_PORT

const sequelize = new Sequelize(db, user, password, {
  host,
  port,
  dialect: "mysql",
  logging: false,
})

export default sequelize
