# Moderator Dashboard Browser Extension

A browser extension (Chrome/Edge) for quick access to the Moderator Statistics Dashboard. This extension provides faster access to the dashboard through a side panel, allowing you to view and manage moderator statistics without leaving your current browser tab.

## Features

- **Side Panel Access**: Quick access to the dashboard via browser side panel
- **Keyboard Shortcut**: Press `Alt+M` to open the dashboard instantly
- **Fast Loading**: Connects to your local server for real-time data
- **Offline Detection**: Shows helpful message if server is not running
- **Same Features**: All dashboard features available in the extension

## Installation

### For Chrome/Edge (Chromium-based browsers)

1. **Start the Server First**:
   ```bash
   cd moderator-dashboard
   npm start
   ```
   The server should be running on `http://localhost:3000`

2. **Load the Extension**:
   - Open Chrome/Edge and go to `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Navigate to and select the `moderator-dashboard/extension` folder
   - The extension should now appear in your extensions list

3. **Access the Dashboard**:
   - Click the extension icon in your browser toolbar, OR
   - Press `Alt+M` keyboard shortcut, OR
   - Right-click the extension icon and select "Open side panel"

## Usage

### Opening the Dashboard

- **Click Extension Icon**: Click the Moderator Dashboard icon in your browser toolbar
- **Keyboard Shortcut**: Press `Alt+M` from any tab
- **Side Panel**: The dashboard opens in a side panel, allowing you to view it alongside your current page

### Features Available

- View all moderators and their statistics
- Search and filter moderators
- Add monthly statistics
- Export data as CSV
- View summary cards and top performers
- Toggle dark/light theme

## Configuration

The extension connects to `http://localhost:3000` by default. If your server runs on a different port or URL, edit `sidepanel.js`:

```javascript
const API_BASE = 'http://localhost:3000/api';
```

Change this to match your server configuration.

## Requirements

- The moderator dashboard server must be running (`npm start` in the main dashboard directory)
- Server should be accessible at `http://localhost:3000`
- Browser must support Manifest V3 (Chrome 88+, Edge 88+)

## Troubleshooting

### Extension shows "Server not available"

1. Make sure the server is running: `npm start` in the `moderator-dashboard` directory
2. Check that the server is running on port 3000
3. Try clicking "Retry Connection" in the extension

### Extension doesn't load

1. Make sure you're using a Chromium-based browser (Chrome, Edge, Brave, etc.)
2. Enable Developer mode in `chrome://extensions/`
3. Check for errors in the extension console (right-click extension icon → Inspect popup)

### Keyboard shortcut doesn't work

1. Go to `chrome://extensions/shortcuts` (or `edge://extensions/shortcuts`)
2. Find "Moderator Statistics Dashboard"
3. Set the shortcut for "Open Moderator Dashboard"

## Icons

Icons are automatically generated! You have two options:

### Option 1: Generate Icons with HTML (Easiest - No Installation Required)

1. Open `generate-icons.html` in your web browser
2. Click "Download All Icons"
3. Move the downloaded PNG files to the `extension/icons/` directory

### Option 2: Generate Icons with Node.js Script

1. Install canvas package (if not already installed):
   ```bash
   npm install canvas
   ```
2. Run the generator script:
   ```bash
   cd extension
   node generate-icons.js
   ```
3. Icons will be automatically created in the `icons/` directory

The icons feature a blue gradient background with a white bar chart, representing statistics and analytics.

## Development

To modify the extension:

1. Edit files in the `extension/` directory
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card to reload changes

## Notes

- The extension requires the main dashboard server to be running
- All data is stored on the server (SQLite database)
- The extension acts as a client interface to the server
- Theme preferences are saved in browser storage (syncs across devices if signed in)

