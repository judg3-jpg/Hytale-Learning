# 🎮 Hypixel Creator Manager v2.1

A Microsoft Edge extension to streamline your Hypixel creator sheet management with CSV import/export, full dashboard, and side panel - **no API or cloud connection needed!**

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![Platform](https://img.shields.io/badge/platform-Microsoft%20Edge-blue)
![Privacy](https://img.shields.io/badge/data-100%25%20local-green)

## ✨ Features

### 📊 Full Dashboard
- Statistics overview (total creators, reviews needed, warnings, inactive)
- Charts showing creators by rank and language
- Searchable creators table
- Review queue with bulk actions
- Warnings and inactive creators views

### 📋 Side Panel
- Opens alongside your browser
- Quick review actions
- Creator details card
- Quick notes (inactive, non-gaming, reviewed)
- Search creators

### 📤 CSV Workflow
- **No API setup required!**
- Export your Google Sheet as CSV
- Upload to the extension
- Make edits, add notes, review creators
- Export back to CSV
- Import back into Google Sheets

### ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Alt+R` | Quick Review |
| `Alt+1` | Note: Channel inactive |
| `Alt+2` | Note: Non-gaming content |
| `Alt+3` | Note: Content reviewed ✓ |

## 🚀 Installation

1. **Download** this repository (or clone it)
2. Open Edge and go to `edge://extensions/`
3. Enable **"Developer mode"** (bottom-left toggle)
4. Click **"Load unpacked"**
5. Select the `hypixel-creator-manager` folder
6. **Pin the extension** to your toolbar

That's it! No API keys, no accounts, no setup.

## 📖 How to Use

### Step 1: Export from Google Sheets
1. Open your Creator Sheet in Google Sheets
2. Click **File** → **Download** → **Comma-separated values (.csv)**
3. Save the file

### Step 2: Upload to Extension
1. Click the extension icon → **Open Dashboard**
2. Drag & drop your CSV file (or click to browse)
3. Done! Your data is loaded.

### Step 3: Manage Creators
- Use the **Dashboard** for full overview and bulk actions
- Use the **Side Panel** for quick reviews while browsing
- Search, filter, add notes, mark as reviewed

### Step 4: Export Your Changes
1. In Dashboard, click **Export CSV**
2. Your updated data downloads as a CSV file

### Step 5: Import Back to Google Sheets
1. Open Google Sheets
2. **File** → **Import** → **Upload** → Select your exported CSV
3. Choose "Replace spreadsheet" or "Replace current sheet"
4. Done!

## 📊 Sheet Column Format

The extension expects these columns (in order):

| # | Column Name | What it's for |
|---|-------------|---------------|
| A | UUID | Unique identifier |
| B | Name (At Last Check) | Creator name |
| C | Main Channel | YouTube/Twitch URL |
| D | Date Accepted | When accepted |
| E | Verified By | Who verified |
| F | Accepted By | Who accepted |
| G | **Last Checked** | ← Updated by extension |
| H | **Content Review By** | ← Updated by extension |
| I | Creator code | Creator code |
| J | Subscribers | Sub count |
| K | Last Upload | Upload date |
| L | Last Upload | Time since upload |
| M | Rank Given | Creator rank |
| N | Content Type | Type |
| O | Video Category | Category |
| P | Locale | Location |
| Q | Content Language | Language |
| R | Contact Email | Email |
| S | Zendesk ID | Support ID |
| T | **Notes** | ← Updated by extension |
| U | Reference Tags | Tags |
| V | Reports | Reports |
| W | **Warnings** | ← Updated by extension |
| X | **Requires Checkup** | ← Cleared by extension |

## ⚙️ Settings

Access settings in the Dashboard:

| Setting | Default | Description |
|---------|---------|-------------|
| Your Name | Judge | Name used for "Content Review By" |
| Overdue Threshold | 3 months | When to flag reviews as overdue |
| Inactive Threshold | 6 months | When to flag channels as inactive |

## 🔒 Privacy

- **100% Local** - All data stays in your browser
- **No Cloud** - Nothing is sent to any server
- **No Accounts** - No login required
- **No API Keys** - No setup needed

Your creator data never leaves your computer.

## 🐛 Troubleshooting

### CSV not importing?
- Make sure it's a valid .csv file
- Check that the first row contains headers
- Try exporting from Google Sheets again

### Side panel not opening?
- Click the extension icon → "Open Side Panel"
- Or right-click anywhere → "Creator Manager" → "Open Side Panel"

### Data disappeared?
- Data is stored in your browser's local storage
- Clearing browser data will remove it
- Always export your CSV before clearing browser data!

## 🔮 Future Enhancements

- [ ] YouTube API integration for auto-fetching stats
- [ ] Twitch API integration
- [ ] Multiple sheet support
- [ ] Custom column mapping
- [ ] Review history tracking
- [ ] Team sync via file sharing

## 📄 License

MIT License - Feel free to modify and use for your team!

## 💜 Credits

Made with 💜 for the Hypixel Creator Team by Judge

---

**Questions?** Open an issue or contact Judge!
