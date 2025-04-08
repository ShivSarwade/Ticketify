import mongoose from "mongoose";

const connectDB=async()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log(`\n MONGO DB CONNECTED, DB HOST:${connectionInstance.connection.host}`);
    }
    catch(error){
        console.log("MONGODB CONNECTION FAILED:" ,error.message);
        process.exit(1)
    }
}

export default connectDB