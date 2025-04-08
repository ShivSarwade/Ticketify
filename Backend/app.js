import express from "express"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import eventRouter from "./routes/event.routes.js"
import ticketRouter from "./routes/ticket.routes.js"
import organizerRouter from "./routes/organizer.routes.js"
const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: "1mb"}))
app.use(express.urlencoded({extended: true, limit: "1mb"}))
app.use(express.static("public"))


app.use("/api/v1/user",userRouter)//http://localhost:7000/api/v1/user/testing
app.use("/api/v1/organiser",organizerRouter)//http://localhost:7000/api/v1/user/testing
app.use("/api/v1/events",eventRouter)//http://localhost:7000/api/v1/user/testing
app.use("/api/v1/tickets",ticketRouter)//http://localhost:7000/api/v1/user/testing


export { app }