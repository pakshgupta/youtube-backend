import dotenv from 'dotenv'
import connectDB from "./db/index.js"
import { app } from './app.js'
dotenv.config({
    path:'./env'
})
connectDB()
.then(()=>{
   
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server connection successful at port ,${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("Mongo Db connection failed !!",error);
})




/* 
This is the first approach for connecting backend 

import express from 'express';
const app=express();
(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{      // This is to check if our express app is getting problem in connecting
            console.log("Error:",error);
            throw error;
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening at port number,${process.env.PORT}`);
        })
    }
    catch(error){
        console.error("Error is :",error);
        throw error;
    }
})()
*/