import { Router } from 'express'
import { verifyInternalKey } from '../middleware/internal.js'
const router = Router()

import { send } from '../controllers/notification-controller.js'

router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'notification-service' })
})

router.post('/send', verifyInternalKey, send)

export default router
