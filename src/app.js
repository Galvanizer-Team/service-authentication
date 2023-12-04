import "dotenv/config"
import Express, { json } from "express"
import sequelize from "./database/database"
import errorMiddleware from "./middleware/errorMiddleware"

const PORT = process.env.PORT || 3000
const app = Express()

app.use(json())

import baseRoutes from "./routes/baseRoutes"
import registerRoutes from "./routes/registerRoutes"
import loginRoutes from "./routes/loginRoutes"
import passwordRoutes from "./routes/passwordRoutes"
import userRoutes from "./routes/userRoutes"
import roleRoutes from "./routes/roleRoutes"

app.use("/", baseRoutes)
app.use("/register", registerRoutes)
app.use("/login", loginRoutes)
app.use("/password", passwordRoutes)
app.use("/users", userRoutes)
app.use("/roles", roleRoutes)

app.use(errorMiddleware)

app.listen(PORT, async () => {
  console.log(`App listening at port ${PORT}`)
  try {
    await sequelize.sync()
  } catch (error) {
    console.error("Error syncing database:", error)
  }
})
