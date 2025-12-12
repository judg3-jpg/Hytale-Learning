# 🎮 Hypixel Creator Manager

A Microsoft Edge extension to streamline your Hypixel creator sheet management with quick reviews, auto-fill, hotkeys, and bulk actions.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Microsoft%20Edge-blue)

## ✨ Features

### ⚡ Quick Actions
- **Quick Review (Alt+R)** - Copies today's date to clipboard for easy pasting into "Last Checked" column
- **Open Channel (Alt+O)** - Quick access to creator's YouTube/Twitch channel
- **Clear Checkup Flag** - Remove the "Requires Checkup" flag after review
- **Add Warning** - Add a timestamped warning to the Warnings column

### 📝 Quick Notes (with Hotkeys)
- **Alt+1** - "Channel inactive - no uploads in X months"
- **Alt+2** - "Channel no longer produces gaming content"
- **Alt+3** - "Content reviewed - meets standards ✓"
- **Custom Notes** - Add your own notes with automatic timestamps

### 🔍 Bulk Actions
- **Find Overdue Reviews** - Locate creators who haven't been reviewed in 3+ months
- **Find Inactive Channels** - Find creators who haven't uploaded in 6+ months
- **Highlight Checkups** - Highlight rows that need attention
- **Clear Highlights** - Remove all highlights

### 🖱️ Right-Click Context Menu
Right-click anywhere on your Google Sheet to access:
- Quick Review
- Insert Notes (Inactive, Non-gaming, Reviewed)
- Add Warning
- Clear Checkup Flag
- Search selected text on YouTube

## 📦 Installation

### Method 1: Load Unpacked Extension (Recommended for Development)

1. **Download/Clone this repository**
   ```bash
   git clone <repository-url>
   ```
   Or download and extract the ZIP file.

2. **Open Edge Extensions Page**
   - Open Microsoft Edge
   - Navigate to `edge://extensions/`
   - Or click Menu (⋯) → Extensions → Manage extensions

3. **Enable Developer Mode**
   - Toggle "Developer mode" switch in the bottom-left corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to the `hypixel-creator-manager` folder
   - Select the folder and click "Select Folder"

5. **Pin the Extension**
   - Click the puzzle piece icon in the toolbar
   - Click the pin icon next to "Hypixel Creator Manager"

### Method 2: Create Icons (Required)

Before loading the extension, you need to create icon files. You can:

**Option A: Use placeholder icons**
Create simple PNG files (16x16, 48x48, 128x128 pixels) in the `icons/` folder:
- `icon16.png`
- `icon48.png`
- `icon128.png`

**Option B: Use an online icon generator**
1. Go to [favicon.io](https://favicon.io/emoji-favicons/) or similar
2. Search for a game controller emoji (🎮)
3. Download and rename the files appropriately

## 🚀 Usage

### Getting Started

1. **Open your Creator Google Sheet**
   - Navigate to your Hypixel creator spreadsheet

2. **Click the Extension Icon**
   - The popup will show "Connected to Google Sheet"

3. **Select a Row**
   - Click any cell in the row of the creator you want to work with

4. **Use Quick Actions**
   - Click buttons in the popup, or use keyboard shortcuts

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+R` | Quick Review - Copy date for Last Checked |
| `Alt+1` | Insert "Channel inactive" note |
| `Alt+2` | Insert "Non-gaming content" note |
| `Alt+3` | Insert "Content reviewed" note |
| `Alt+O` | Open channel helper |

### Workflow Example

1. Select a creator row in your sheet
2. Press `Alt+R` to start a quick review
3. Paste (`Ctrl+V`) the date in column G (Last Checked)
4. Type your name in column H (Content Review By) - or it's pre-saved as "Judge"
5. If needed, press `Alt+1/2/3` to add a quick note, then paste in column T
6. Move to the next creator!

## ⚙️ Settings

Click the **⚙️ Settings** section in the popup to customize:

| Setting | Default | Description |
|---------|---------|-------------|
| Reviewer Name | Judge | Your name for "Content Review By" column |
| Overdue after (months) | 3 | When to flag reviews as overdue |
| Inactive after (months) | 6 | When to flag channels as inactive |

## 📋 Sheet Column Reference

The extension is designed for sheets with these columns:

| Column | Letter | Purpose |
|--------|--------|---------|
| UUID | A | Unique identifier |
| Name | B | Creator name |
| Main Channel | C | YouTube/Twitch URL |
| Date Accepted | D | When accepted |
| Verified By | E | Who verified |
| Accepted By | F | Who accepted |
| **Last Checked** | **G** | Last review date |
| **Content Review By** | **H** | Reviewer name |
| Creator Code | I | Creator code |
| Subscribers | J | Sub count |
| Last Upload | K | Upload date |
| Last Upload | L | Time since upload |
| Rank Given | M | Creator rank |
| Content Type | N | Type |
| Video Category | O | Category |
| Locale | P | Location |
| Content Language | Q | Language |
| Contact Email | R | Email |
| Zendesk ID | S | Support ID |
| **Notes** | **T** | Notes |
| Reference Tags | U | Tags |
| Reports | V | Reports |
| **Warnings** | **W** | Warnings |
| **Requires Checkup** | **X** | Checkup flag |

## 🐛 Troubleshooting

### Extension not working?
1. Make sure you're on a Google Sheets page (`docs.google.com/spreadsheets/`)
2. Refresh the page after installing the extension
3. Check that the extension is enabled in `edge://extensions/`

### Hotkeys not working?
1. Make sure the Google Sheet tab is focused
2. Check for conflicts with other extensions
3. Try clicking inside the sheet first

### Clipboard not working?
1. Make sure you've granted clipboard permissions
2. Some browsers require HTTPS (Google Sheets uses HTTPS, so this should be fine)

## 🔮 Future Enhancements

- [ ] YouTube API integration for auto-fetching stats
- [ ] Twitch API integration
- [ ] Batch review mode
- [ ] Export review reports
- [ ] Custom hotkey configuration
- [ ] Dark/light theme toggle

## 📄 License

MIT License - Feel free to modify and use for your team!

## 💜 Credits

Made with 💜 for the Hypixel Creator Team

---

**Need help?** Open an issue or contact Judge!
