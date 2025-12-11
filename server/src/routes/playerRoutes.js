import { Router } from 'express'
import {
  getAllPlayers,
  getPlayerById,
  searchPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayerStats,
} from '../controllers/playerController.js'
import { getNotesByPlayer, createNote } from '../controllers/noteController.js'
import { getPunishmentsByPlayer } from '../controllers/punishmentController.js'
import { getActivityByPlayer } from '../controllers/activityController.js'

const router = Router()

// Player routes
router.get('/', getAllPlayers)
router.get('/search', searchPlayers)
router.get('/:id', getPlayerById)
router.get('/:id/stats', getPlayerStats)
router.post('/', createPlayer)
router.put('/:id', updatePlayer)
router.delete('/:id', deletePlayer)

// Player sub-resources
router.get('/:id/punishments', getPunishmentsByPlayer)
router.get('/:id/notes', getNotesByPlayer)
router.post('/:id/notes', createNote)
router.get('/:id/activity', getActivityByPlayer)

export default router
