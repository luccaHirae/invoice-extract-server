import express, { Router } from 'express';
import multer from 'multer';
import {
  saveInvoice,
  getInvoices,
  aggregateInvoiceData,
} from '../controllers/invoice-controllers';
import { PrismaClient } from '@prisma/client';

const createRouter = (prisma: PrismaClient): Router => {
  const router = express.Router();
  const upload = multer({
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf']; // Allowed MIME types
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF files are allowed.'));
      }
    },
  });

  router.get('/', (req, res) => getInvoices(req, res, prisma));
  router.get('/aggregate', (req, res) =>
    aggregateInvoiceData(req, res, prisma)
  );
  router.post('/', upload.array('file'), (req, res) =>
    saveInvoice(req, res, prisma)
  );

  return router;
};

export default createRouter;
