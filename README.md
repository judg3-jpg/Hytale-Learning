# Hytale Moderation Tool

An in-game style moderation tool for Hytale servers. Built with Electron for a native desktop experience with a game-like UI.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Mac%20%7C%20Linux-lightgrey.svg)

## Features

- 🎮 **Game-Style UI** - Dark themed interface that looks like an in-game overlay
- 🎯 **Player Targeting** - Select and view detailed player information
- ⌨️ **Keyboard Shortcuts** - Quick actions with single key presses
- ⚖️ **Moderation Actions** - Warn, Mute, Kick, Ban players
- 📝 **Notes System** - Add notes to player profiles
- 📜 **Activity Logging** - Track all moderation activity
- 🔍 **Player Search** - Quickly find players by name

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `X` | Teleport to player |
| `W` | Warn player |
| `M` | Mute player |
| `K` | Kick player |
| `B` | Ban player |
| `I` | View inventory |
| `N` | View/add notes |
| `H` | View history |
| `C` | Untarget player |
| `Esc` | Close modal |

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Seed the database with sample data:**
   ```bash
   npm run seed
   ```

3. **Start the application:**
   ```bash
   npm start
   ```

## Usage

1. **Search for a player** using the search box or press `/`
2. **Click on a player** to target them
3. **Use keyboard shortcuts** or click action buttons to moderate
4. **View player info** in the middle panel
5. **Check history, notes, and activity** using the bottom buttons

## Project Structure

```
hytale-moderation-tool/
├── main.js           # Electron main process
├── preload.js        # Preload script (database & API)
├── package.json
├── src/
│   ├── index.html    # Main window
│   ├── styles/
│   │   └── main.css  # Game-style UI
│   ├── js/
│   │   └── app.js    # Application logic
│   └── database/
│       └── seed.js   # Database seeder
└── data/
    └── moderation.db # SQLite database
```

## Tech Stack

- **Electron** - Desktop application framework
- **SQL.js** - SQLite in JavaScript (no native compilation needed)
- **Pure CSS** - Game-style dark theme UI

## Future Plans

This tool is designed to be ready for integration with Hytale when the game releases with modding support. Features that will be added:

- Real-time player data from game server
- Actual teleportation and spectating
- Inventory viewing
- Chat monitoring
- Anti-cheat integration

## License

MIT License - Feel free to use and modify!
