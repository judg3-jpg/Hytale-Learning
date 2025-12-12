import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Import routes
import playerRoutes from './routes/playerRoutes.js'
import punishmentRoutes from './routes/punishmentRoutes.js'
import noteRoutes from './routes/noteRoutes.js'
import activityRoutes from './routes/activityRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'

// Import database initialization
import { initializeDatabase } from './database/db.js'

// Import error handler
import { errorHandler } from './middleware/errorHandler.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Initialize database
initializeDatabase()

// API Routes
app.use('/api/players', playerRoutes)
app.use('/api/punishments', punishmentRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/activity', activityRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 API available at http://localhost:${PORT}/api`)
})

export default app
