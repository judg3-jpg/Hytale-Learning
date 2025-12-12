import { Router } from 'express'
import { getAllActivity, createActivity } from '../controllers/activityController.js'

const router = Router()

router.get('/', getAllActivity)
router.post('/', createActivity)

export default router
