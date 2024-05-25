import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connection= async () =>{
    try{
         const connectionvar=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
         console.log(`\n Mongodb connected!! DB HOST:${connectionvar.connection.host}`);
    }catch(error){
        console.log("MONGODB connection failed",error);
        process.exit(1)
    }
}

export default connection