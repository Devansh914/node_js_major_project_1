import mongoose, { Schema } from "mongoose";

subscriptionschema =new Schema({
   subscriber:{
    type:Schema.Types.ObjectId, //one who is subscribing
    ref:"User"
   },
   channel:{
    type:Schema.Types.ObjectId, //one who is subscribing
    ref:"User"
   }
})


export const Subscription = mongoose.model("Subscription",subscriptionschema);