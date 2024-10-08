import "dotenv/config";
import express from "express";
import cors from 'cors';

import { productsRouter } from "../routers/Products";
import { userRouter } from "../routers/Users";
import { orderRouter } from "../routers/Orders";
import validateJWT from "../middlewares/validateJWT";
import { verifyTokenRouter } from "../routers/VerifyToken";
import { createServer } from "http";
import { Server as SocketIOServer } from 'socket.io';
import { socketIo } from "../socket/status";
import { stripeRouter } from "../routers/Stripe";

const app = express();

const allowedOrigins = [process.env.ORIGIN_CORS_1, process.env.ORIGIN_CORS_2, process.env.ORIGIN_CORS_3];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true); // Permitir requisições sem 'origin' (ex.: Postman)

    if (allowedOrigins.includes(origin)) {
      callback(null, true); // Permitir a origem se estiver na lista
    } else {
      callback(new Error('Not allowed by CORS')); // Bloquear se a origem não estiver permitida
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
  allowedHeaders: ['Content-Type', 'Authorization'], 
}

app.use(cors(corsOptions));
app.use(express.json());


app.use('/products', productsRouter);
app.use('/user', userRouter);
app.use('/verifyToken', validateJWT, verifyTokenRouter)
app.use('/orders', validateJWT,  orderRouter);
app.use('/api/checkout_sessions', validateJWT, stripeRouter)

const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ORIGIN_CORS,
    methods: ['GET', 'POST'],
  },
});

socketIo(io);

export { server };
