import { Router } from 'express'
import {
  getAllPunishments,
  getActivePunishments,
  createPunishment,
  revokePunishment,
  getPunishmentStats,
} from '../controllers/punishmentController.js'

const router = Router()

router.get('/', getAllPunishments)
router.get('/active', getActivePunishments)
router.get('/stats', getPunishmentStats)
router.post('/', createPunishment)
router.post('/:id/revoke', revokePunishment)

export default router
