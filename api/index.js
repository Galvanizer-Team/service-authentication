import Express, { json } from "express"
import "dotenv/config"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import sequelize from "./config/database"
import requireSSL from "./middleware/requireSSL"

// Routes

import baseRoutes from "./routes/baseRoutes"
import registerRoutes from "./routes/registerRoutes"
import loginRoutes from "./routes/loginRoutes"
import passwordRoutes from "./routes/passwordRoutes"
import userRoutes from "./routes/userRoutes"
import refreshRoutes from "./routes/refreshRoutes"
import totpRoutes from "./routes/totpRoutes"

// DB Models

import "./models/index"

const PORT = process.env.PORT || 3000
const app = Express()

app.set("trust proxy", 1)

app.use(json())
app.use(cors())
app.use(helmet())
app.use(cookieParser())
app.use(requireSSL)

app.use("/", baseRoutes)
app.use("/register", registerRoutes)
app.use("/login", loginRoutes)
app.use("/password", passwordRoutes)
app.use("/users", userRoutes)
app.use("/refresh", refreshRoutes)
app.use("/totp", totpRoutes)

app.listen(PORT, async () => {
  try {
    await sequelize.sync()
  } catch (error) {
    if (process.env.NODE_ENV !== "development") return
    // eslint-disable-next-line no-console
    console.error("Error syncing database:", error.message)
  }
})
