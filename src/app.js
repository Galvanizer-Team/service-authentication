import Express, { json } from "express"

const app = Express()
app.use(json()) // middleware to parse json data
const PORT = process.env.PORT || 3000

import testRoutes from "./routes/testRoutes"

app.use("/", testRoutes)

app.listen(PORT, () => console.log(`App listening at port ${PORT}`))
