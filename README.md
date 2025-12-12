# Hytale Moderation Tool

A complete, modern moderation dashboard for Hytale servers. Built with React, Node.js, and SQLite.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

- **Player Management** - View and manage all players with detailed profiles
- **Moderation Actions** - Warn, Mute, Kick, and Ban players with ease
- **Punishment History** - Track all punishments with full history
- **Notes System** - Add notes to player profiles
- **Activity Logging** - Monitor all player and moderation activity
- **Fast Navigation** - Keyboard shortcuts for power users
- **Dark/Light Theme** - Toggle between themes (dark mode default)
- **Clean UI** - Modern, responsive design

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: SQLite (production-ready, easy to migrate to PostgreSQL)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd hytale-moderation-tool
   ```

2. Install all dependencies:
   ```bash
   npm run install:all
   ```

3. Start the development servers:
   ```bash
   npm run dev
   ```

4. Open your browser:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Project Structure

```
hytale-moderation-tool/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── utils/          # Utility functions
│   │   └── context/        # React context providers
│   └── ...
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   ├── models/         # Database models
│   │   ├── database/       # Database setup
│   │   └── middleware/     # Express middleware
│   └── ...
└── ...
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` or `Ctrl+K` | Focus search |
| `Esc` | Close modal |
| `↑` / `↓` | Navigate list |
| `W` | Warn player |
| `M` | Mute player |
| `B` | Ban player |
| `N` | Add note |
| `Ctrl+D` | Toggle theme |

## API Endpoints

### Players
- `GET /api/players` - List all players
- `GET /api/players/:id` - Get player details
- `POST /api/players` - Create player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

### Punishments
- `GET /api/punishments` - List punishments
- `POST /api/punishments` - Create punishment
- `POST /api/punishments/:id/revoke` - Revoke punishment

### Notes
- `GET /api/players/:id/notes` - Get player notes
- `POST /api/players/:id/notes` - Add note

## License

MIT License - feel free to use this for your own projects!
