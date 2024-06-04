import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


cloudinary.config({ 
    cloud_name: CLOUDNAME, 
    api_key: APIKEY, 
    api_secret: APISECRET // Click 'View Credentials' below to copy your API secret
});


const uploadOnCloudinary= async (localFilePath) =>{
    try{
        if(!localFilePath) return null;
        //upload file on cloudinary
        const response= await uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("file is uploaded on cloudinary",response.url);
        return response;
    }catch(error){
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export {uploadOnCloudinary};