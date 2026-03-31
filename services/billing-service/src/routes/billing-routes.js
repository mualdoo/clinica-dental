import { Router } from 'express';
const router = Router();

import treatmentController from '../controllers/treatment-controller.js';
import quoteController from '../controllers/quote-controller.js';
import quoteItemController from '../controllers/quote-item-controller.js';
import paymentController from '../controllers/payment-controller.js';

// Treatment
router.get('/treatment', treatmentController.findAll);
router.get('/treatment/:id', treatmentController.findById);
router.post('/treatment', treatmentController.create);
router.patch('/treatment/:id', treatmentController.update);
router.delete('/treatment/:id', treatmentController.remove);

// Quote
router.get('/quote', quoteController.findAll);
router.get('/quote/:id', quoteController.findById);
router.get('/quote/patient/:patientId', quoteController.findByPatient);
router.post('/quote', quoteController.create);
router.patch('/quote/:id', quoteController.update);
router.delete('/quote/:id', quoteController.remove);

// Quote Item
router.post('/quote/:id/item', quoteItemController.create);

router.get('/quote-item', quoteItemController.findAll);
router.get('/quote-item/:id', quoteItemController.findById);
router.patch('/quote-item/:id', quoteItemController.update);
router.delete('/quote-item/:id', quoteItemController.remove);

// Payment
router.post('/quote/:id/payment', paymentController.create);

router.get('/payment', paymentController.findAll);
router.get('/payment/:id', paymentController.findById);

export default router;