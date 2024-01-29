import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDatabase from './database/db.js';
import userRouter from './controller/userController.js';


dotenv.config();

const port = process.env.PORT || 5500;

connectDatabase();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/user/', userRouter);

app.get('/', (req, res) => res.send(`Backend is ready`))

app.listen(port, () => console.log(`Backend is connected to port: ${port}`))