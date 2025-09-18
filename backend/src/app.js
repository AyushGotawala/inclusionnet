import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './routes/authRoute.js';
import path from 'path';
import { handleInvalidRoute } from './middlewares/invalidRoute.js';
import kycRouter from './routes/kycRoutes.js';


const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use('/kyc/upload', express.static(path.join(process.cwd(), 'src/public/kyc/upload')));

app.use('/api/auth',authRouter);
app.use('/api',kycRouter);

app.use(handleInvalidRoute);

app.get('/',(req,res,next)=>{
    res.status(200).send('<h1>Server is Running....</h1>')
})

export default app;