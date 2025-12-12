import { Router } from 'express'
import { getDashboardStats, getRecentActivity } from '../controllers/dashboardController.js'

const router = Router()

router.get('/stats', getDashboardStats)
router.get('/recent', getRecentActivity)

export default router
