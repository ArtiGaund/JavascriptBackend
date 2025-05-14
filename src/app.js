import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// creating an app
const app = express();

// cors configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

// setting middleware 
// data coming from form
app.use(express.json({ limit: "16kb"}))
// data coming from url 
app.use(express.urlencoded({ extended: true, limit: "16kb"}))
// want to store file or folder(pdf file,image) i want to store these in my server, so we create public folder (assests)
app.use(express.static("public"))
// to access cookies and set cookies of user browser
app.use(cookieParser())


//routes (import here only after all middleware, cookies) file segregation
import userRouter from './routes/user.routes.js'
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/videos.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter) 
// creating our own api's
//https://localhost:8000/api/v1/users/register or /login (for login you don't have write again this api is written for
// all methods of users)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/healthcheck",healthcheckRouter)
app.use("/api/v1/tweet",tweetRouter)
app.use("/api/v1/subscription",subscriptionRouter)
app.use("/api/v1/videos",videoRouter)
app.use("api/v1/playlist",playlistRouter)
app.use("/api/v1/dashboard",dashboardRouter)

export { app }