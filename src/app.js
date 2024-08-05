import express from "express"
import cors from 'cors';
import cookieParser from 'cookie-parser';
//app.use() is mostly used for middleware configration
const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,  // we can configure cors like their origin and credentail
    // we can see the attributes with ctrl+space
    credentials:true,
}))

app.use(express.json({limit:"16kb"})) //express.json() let us configure to take json file and also give limit to it
app.use(express.urlencoded({extended:true,limit:"16kb"})) //making the url encoded
app.use(express.static("public"))

app.use(cookieParser())

export default {app} ;