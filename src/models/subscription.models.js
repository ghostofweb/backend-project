import  mongoose,{Schema}  from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, // the one whos Subscribing the channel
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, // the one who is being subscribed to
        ref:"User"
    }
},{timeseries:true})


export const Subscription = mongoose.model("Subscription",subscriptionSchema) 