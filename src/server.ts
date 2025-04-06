import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

/* Route Imports */
import { PrismaClient } from '@prisma/client';
import createRouter from './routes/invoice-routes';

/* Config */
dotenv.config();

const createApp = (prisma: PrismaClient) => {
  const app = express();
  const invoiceRouter = createRouter(prisma);

  app.use(helmet());
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
  app.use(morgan('common'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());

  /* Routes */
  app.get('/', (_req, res) => {
    res.send('Hello World');
  });
  app.use('/invoices', invoiceRouter);

  return app;
};

export default createApp;
