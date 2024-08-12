import mongoose , {Schema} from "mongoose";
import mongooseAggregatePeginate  from 'mongoose-aggregate-paginate-v2';

const videoSchema  = new Schema(
    {
        videosFile:{
            type:String,     //cloudinary url
            required:true 
        },
        thumbnail:{
            type:String,    //cloudinary url
            required:true 
        },
        title:{
            type:String, 
            required:true 
        },
        description:{
            type:String, 
            required:true 
        },
        duration:{
            type:Number,     // Cloudniary, we get the duation of videos from cloud 
            required:true 
        },
        views:{
            type:Number,
            default:0
        },
        published:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }

    }
    
,{timestamps:true})

videoSchema.plugin(mongooseAggregatePeginate)

export const Video = mongoose.model("Video",videoSchema) 