// connecting through mongoose
import mongoose from "mongoose";
// database name
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        // connection.host give mongodb url, tell us which host we are connecting
        console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED: ",error);
        //nodejs give access of process, this application will be running on 1 process and this process is reference 
        // of that process
        process.exit(1)
    }
}

export default connectDB;
