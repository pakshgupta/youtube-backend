import mongoose  from "mongoose";
import { DB_NAME } from "../constants.js";
import { app } from "../app.js";
const connectDB=async ()=>{
    try{
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\nMONGODB connected !! DB HOST: ${connectionInstance.connection.host}`)
        // connectionInstance.connection.host is to know on host it is connected
        app.on("error",(error)=>{
            console.log('Express server connection failed',error);
            throw error;
        })
    }
    catch(error){
        console.error("Mongo DB connection Failed:",error);
        process.exit(1)
    }
}
export default connectDB