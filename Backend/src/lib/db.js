import mongoose from 'mongoose';

export const connectDB = async () => {
    try{
        const conn=await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }catch(error) {
        console.error(`MongoDB connection Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};


        
    