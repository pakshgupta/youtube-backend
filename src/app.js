import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app=express();
const corsOptions={
    origin:process.env.CORS_ORIGIN,
    credentials:true
}
app.use(cors(corsOptions))

// These are the configuration 
app.use(express.json({limit:"16kb"}))  // accept json with a limit of 16kb so that my server do not crash
app.use(express.urlencoded({extended:true,limit:"16kb"}))  // to configure url in some url space can be trated as %20 in some + so to configure it we use this
app.use(express.static("public"))  // static folders which any one can access.
app.use(express.cookieParser()) // server s user k browser ki cookies ko access krke unpe CRUD operation perform kr paye
export {app}