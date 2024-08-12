/* cloudinary and multer are used to store the files of images and videos from the user
Multer: multer is used to get access and we can store this in the local database of us
because there are times where it might need change or some error which we can fix before storing in
cloudinary
Cloudinary: cloudinary is the service like AWS which let us store the data like images and videos*/

import fs from "fs"                                 // fileSystem, already in the node.js
import { v2 as cloudinary } from 'cloudinary'; 
import { log } from "console";
import { response } from "express";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET });

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if (!localFilePath) return null;
        //now upload the file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        //File has been uploaded to the cloudinary
        console.log("file is uploaded on cloudinary", response.url);
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temp file as the upload
    }
}

export {cloudinary};