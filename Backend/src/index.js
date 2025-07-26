import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import userRoutes from './routes/user.route.js';

import { connectDB } from './lib/db.js';
import { protectRoute } from './middleware/auth.protectRoute.js'; // <--- ADD THIS LINE! Assuming path is correct

dotenv.config();

const app=express();

const PORT=process.env.PORT;

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", protectRoute, userRoutes); // <--- MODIFY THIS LINE: Add protectRoute middleware

app.listen(PORT,()=>{
    console.log('Server is running on PORT:',PORT);
    connectDB();
});
