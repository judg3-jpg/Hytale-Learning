import { Router } from 'express'
import { updateNote, deleteNote } from '../controllers/noteController.js'

const router = Router()

router.put('/:id', updateNote)
router.delete('/:id', deleteNote)

export default router
