import db from '../database/db.js'
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js'

// Get notes by player
export function getNotesByPlayer(req, res, next) {
  try {
    const { id } = req.params

    const player = db.prepare('SELECT id FROM players WHERE id = ?').get(id)
    if (!player) {
      throw new NotFoundError('Player not found')
    }

    const notes = db.prepare(`
      SELECT * FROM notes
      WHERE player_id = ?
      ORDER BY is_important DESC, created_at DESC
    `).all(id)

    res.json(notes)
  } catch (error) {
    next(error)
  }
}

// Create note
export function createNote(req, res, next) {
  try {
    const { id } = req.params
    const { content, is_important = false } = req.body

    if (!content || content.trim().length === 0) {
      throw new ValidationError('Note content is required')
    }

    const player = db.prepare('SELECT id, player_name FROM players WHERE id = ?').get(id)
    if (!player) {
      throw new NotFoundError('Player not found')
    }

    const result = db.prepare(`
      INSERT INTO notes (player_id, content, is_important)
      VALUES (?, ?, ?)
    `).run(id, content.trim(), is_important ? 1 : 0)

    // Log activity
    db.prepare(`
      INSERT INTO activity_log (player_id, action_type, details)
      VALUES (?, 'note', ?)
    `).run(id, content.substring(0, 100))

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid)

    res.status(201).json(note)
  } catch (error) {
    next(error)
  }
}

// Update note
export function updateNote(req, res, next) {
  try {
    const { id } = req.params
    const { content, is_important } = req.body

    const note = db.prepare('SELECT id FROM notes WHERE id = ?').get(id)
    if (!note) {
      throw new NotFoundError('Note not found')
    }

    const updates = []
    const values = []

    if (content !== undefined) {
      if (content.trim().length === 0) {
        throw new ValidationError('Note content cannot be empty')
      }
      updates.push('content = ?')
      values.push(content.trim())
    }

    if (is_important !== undefined) {
      updates.push('is_important = ?')
      values.push(is_important ? 1 : 0)
    }

    if (updates.length === 0) {
      throw new ValidationError('No valid fields to update')
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    db.prepare(`
      UPDATE notes SET ${updates.join(', ')} WHERE id = ?
    `).run(...values)

    const updatedNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(id)

    res.json(updatedNote)
  } catch (error) {
    next(error)
  }
}

// Delete note
export function deleteNote(req, res, next) {
  try {
    const { id } = req.params

    const note = db.prepare('SELECT id FROM notes WHERE id = ?').get(id)
    if (!note) {
      throw new NotFoundError('Note not found')
    }

    db.prepare('DELETE FROM notes WHERE id = ?').run(id)

    res.json({ message: 'Note deleted successfully' })
  } catch (error) {
    next(error)
  }
}
