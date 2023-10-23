import Express, { json } from "express"
import "dotenv/config"
import sequelize from "./database/database"

const app = Express()
app.use(json()) // middleware to parse json data
const PORT = process.env.PORT || 3000

import testRoutes from "./routes/testRoutes"
import userRoutes from "./routes/userRoutes"
import baseRoutes from "./routes/baseRoutes"

app.use("/", baseRoutes)
app.use("/user", userRoutes)
app.use("/test", testRoutes)

app.listen(PORT, async () => {
  console.log(`App listening at port ${PORT}`)
  try {
    await sequelize.sync()
  } catch (error) {
    console.error("Error syncing database:", error)
  }
})
