import dotenv from "dotenv";
import {app} from './app.js';
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
.then(() =>{
    app.listen(process.env.PORT || 8000,() =>{
        console.log('server is running at port :${process.env.PORT}')
    })
})
.catch((err)=>{
    console.log("MONGO db connected failed !!!",err);
})