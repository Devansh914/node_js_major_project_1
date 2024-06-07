import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


cloudinary.config({ 
    cloud_name:"dlzvght3z", 
    api_key: "376252725245541", 
    api_secret:"vs7gJAPAI76f4jkfq4YECr2v4uQ" // Click 'View Credentials' below to copy your API secret
});


const uploadOnCloudinary= async (localFilePath) =>{
    try{
        
        if(!localFilePath) return null;
        console.log(localFilePath);
        //upload file on cloudinary
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        });
        // console.log("file is uploaded on cloudinary",response);
        fs.unlinkSync(localFilePath);
        return response;
    }catch(error){
        // fs.unlinkSync(localFilePath);
        console.log(error);
        return null;
    }
}

export {uploadOnCloudinary};