import { Router } from 'express';
import { invoiceController } from './invoice.controller.js';

const router = Router();

router.get('/lookup', invoiceController.lookup);
router.get('/uhid/:uhid', invoiceController.getByUhid);
router.get('/booking/:bookingNo', invoiceController.getByBooking);

export default router;
