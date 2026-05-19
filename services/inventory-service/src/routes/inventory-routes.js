import { Router } from 'express'
const router = Router()
import { authorize } from '../middleware/role-check.js'

import { supplierController } from '../controllers/supplier-controller.js'
import { itemController } from '../controllers/item-controller.js'
import { movementController } from '../controllers/movement-controller.js'
import { orderController } from '../controllers/order-controller.js'

// Supplier
router.get(
    '/supplier',
    authorize(['admin', 'receptionist']),
    supplierController.findAll
)
router.get(
    '/supplier/:id',
    authorize(['admin', 'receptionist']),
    supplierController.findById
)
router.post(
    '/supplier',
    authorize(['admin', 'receptionist']),
    supplierController.create
)
router.patch(
    '/supplier/:id',
    authorize(['admin', 'receptionist']),
    supplierController.update
)
router.delete(
    '/supplier/:id',
    authorize(['admin', 'receptionist']),
    supplierController.remove
)

// Item
router.post(
    '/supplier/:id/item',
    authorize(['admin', 'receptionist']),
    itemController.create
)

router.get(
    '/item',
    authorize(['admin', 'receptionist', 'dentist']),
    itemController.findAll
)
router.get(
    '/item/:id',
    authorize(['admin', 'receptionist', 'dentist']),
    itemController.findById
)
router.patch(
    '/item/:id',
    authorize(['admin', 'receptionist']),
    itemController.update
)
router.delete(
    '/item/:id',
    authorize(['admin', 'receptionist']),
    itemController.remove
)

// Stock Movement
router.post(
    '/item/:id/movement',
    authorize(['admin', 'receptionist', 'dentist']),
    movementController.create
)

router.get(
    '/movement',
    authorize(['admin', 'receptionist']),
    movementController.findAll
)
router.get(
    '/movement/:id',
    authorize(['admin', 'receptionist']),
    movementController.findById
)

// Purchase Order
router.post(
    '/item/:id/order',
    authorize(['admin', 'receptionist']),
    orderController.create
)

router.get(
    '/order',
    authorize(['admin', 'receptionist']),
    orderController.findAll
)
router.get(
    '/order/:id',
    authorize(['admin', 'receptionist']),
    orderController.findById
)
router.patch(
    '/order/:id/status',
    authorize(['admin', 'receptionist']),
    orderController.update
)

export default router
