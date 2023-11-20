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


//routes declaration
app.use("/api/v1/users", userRouter) 
// creating our own api's
//https://localhost:8000/api/v1/users/register or /login (for login you don't have write again this api is written for
// all methods of users)


export { app }