import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async ()=>{
    try {
       const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`) // can hold response
       console.log(`MongoDB Connected: ${connectionInstance.connection.host}`)// we can get object where we can get host as well
    } catch (error) {
        console.log("MONGODB connection error",error);
        process.exit(1);
    }
}


export default connectDB;