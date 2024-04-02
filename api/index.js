import Express, { json } from "express"
import "dotenv/config"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
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

export default app
