import dotenv from "dotenv";
import connection from "./db/db_connect.js";
// {async () => {
//     try{
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error",(error)=>{
//          console.log("error",error);
//          throw error;
//        })
//     } catch(error){
//         console.error("ERROR:",error);
//         throw error
//     }
// }}

dotenv.config({
    path:'./env'
});

connection()