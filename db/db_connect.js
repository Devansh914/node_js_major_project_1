import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connection = async () => {
    try {
        const connectionvar = await mongoose.connect("mongodb+srv://devanshupadhyay91:kbBvhZ8CM8gMZOoY@cluster0.e5mudj1.mongodb.net", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: DB_NAME,
        });
        console.log(`MongoDB connected! DB HOST: ${connectionvar.connection.host}`);
    } catch (error) {
        console.error("MONGODB connection failed", error);
        process.exit(1);
    }
};

export default connection;
