import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken" //JWT
import bcrypt from "bcrypt" //bcrypt the file

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true // if u want to make a field to be more searchable use index
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,// cloudnary URL
        required:true,
    },
    coverImage:{
        type:String, // cloudnary URL
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"password is Required"] // custome message
    },
    refreshToken:{
        type:String
    }
},
{
    timestamps:true
})

/* here we have pre, which is mongooose hook where we can make execution of certain action before certain event
like here we have "save" event, now we can make some action on the schema before saving like
bcrypting the password */

//here we should use function rather then ()=>{} because anonymous func dont get reference of this
//
userSchema.pre("save",async function(next){
    // using isModified because the lower code will run again and again whenver user will make some changes in its model
    // so we should check if the password is modified or not 
    if(!this.isModified("password")) return next(); 
    this.password = await bcrypt.hash(this.password,10)
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

//JWT
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Accessed through process.env
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY // Accessed through process.env
        }
    )
}



export const User = mongoose.model("User",userSchema)