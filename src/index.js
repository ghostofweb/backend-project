import dotenv from "dotenv" // although we cant use it directly , we have to make some changes in script
import mongoose from "mongoose"
import express from "express"
import connectDB from "./db/index.js";

// 2 main approch mongodb connection 
//Always USE TRY_CATCH in it and ALWAYS USE ASync Await // beacause its the long process and takes time
// here we are using ifi , direct function call cuz thats what we always have to do
// also we are using ; becuase it indicates that we are using ifi and plus its a good approch
dotenv.config({
    path:'./env' // to set the path directly to the env file
})

const app = express()
connectDB();

/*
1. 1st approch  
;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`) //conencting to the database
        app.on("error",(error)=>{
            console.log("error",error)
            throw error
        })
    } catch (error) {
        console.log("ERROR",error)
    }
})()
*/

app.listen(process.env.PORT,()=>{
    console.log("server is running on port",process.env.PORT)
}) 