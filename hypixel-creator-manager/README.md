# 🎮 Hypixel Creator Manager v2.0

A Microsoft Edge extension to streamline your Hypixel creator sheet management with a full dashboard, side panel, and direct Google Sheets integration.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Microsoft%20Edge-blue)

## ✨ What's New in v2.0

- **📊 Full Dashboard** - A complete overview page with statistics, charts, and bulk management
- **📋 Side Panel** - Quick actions panel that opens alongside your Google Sheet
- **🔗 Real Google Sheets Integration** - Actually reads and writes to your spreadsheet!
- **📈 Statistics** - See total creators, review queue, warnings, and more at a glance
- **🔍 Search** - Quickly find any creator
- **✅ Bulk Review** - Review multiple creators at once

## 🚀 Quick Start

### Step 1: Install the Extension

1. Download/clone this repository
2. Open Edge and go to `edge://extensions/`
3. Enable **"Developer mode"** (bottom-left toggle)
4. Click **"Load unpacked"** and select the `hypixel-creator-manager` folder
5. Pin the extension to your toolbar

### Step 2: Set Up Google Sheets API (Required for full functionality)

To enable the extension to read and write to your Google Sheet, you need to set up Google Cloud credentials:

#### 2.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** (or select an existing project)
3. Give it a name like "Hypixel Creator Manager"

#### 2.2 Enable the Google Sheets API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google Sheets API"
3. Click on it and press **"Enable"**

#### 2.3 Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: "Hypixel Creator Manager"
   - Add your email as a test user
4. For Application type, select **"Chrome Extension"** (works for Edge too)
5. Enter your Extension ID (find it at `edge://extensions/`)
6. Click **Create** and copy the **Client ID**

#### 2.4 Add Client ID to Extension

1. Open the `manifest.json` file in the extension folder
2. Find the `oauth2` section and replace `YOUR_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID:

```json
"oauth2": {
  "client_id": "123456789-abcdefg.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
```

3. Save the file
4. Go to `edge://extensions/` and click **"Reload"** on the extension

### Step 3: Connect Your Sheet

1. Click the extension icon → **"Open Dashboard"**
2. Go to **Settings**
3. Paste your Google Sheet URL or ID
4. Click **"Connect to Sheet"**
5. Authorize the app when prompted

## 📋 Features

### Side Panel
Open alongside your Google Sheet for quick access to:
- Current creator info
- Quick Review button (updates Last Checked + your name)
- Quick Notes (Inactive, Non-gaming, Reviewed)
- Review queue preview
- Warnings

### Dashboard
Full-page management center with:
- **Overview** - Statistics, charts, queue preview
- **All Creators** - Searchable table of all creators
- **Review Queue** - Creators needing review with bulk actions
- **Warnings** - All creators with warnings
- **Inactive** - Creators who haven't uploaded in 6+ months
- **Settings** - Configure your preferences

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Alt+R` | Quick Review |
| `Alt+1` | Note: Channel inactive |
| `Alt+2` | Note: Non-gaming content |
| `Alt+3` | Note: Content reviewed ✓ |

### Right-Click Menu
On your Google Sheet, right-click to access:
- Quick Review
- Open Side Panel
- Open Dashboard
- Insert Notes
- Add Warning
- Search on YouTube

## 📊 Sheet Column Reference

The extension expects these columns in your sheet:

| Column | Letter | Purpose |
|--------|--------|---------|
| UUID | A | Unique identifier |
| Name | B | Creator name |
| Main Channel | C | YouTube/Twitch URL |
| Date Accepted | D | When accepted |
| Verified By | E | Who verified |
| Accepted By | F | Who accepted |
| **Last Checked** | **G** | Last review date ← Auto-updated |
| **Content Review By** | **H** | Reviewer name ← Auto-updated |
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
| **Notes** | **T** | Notes ← Can be updated |
| Reference Tags | U | Tags |
| Reports | V | Reports |
| **Warnings** | **W** | Warnings ← Can be updated |
| **Requires Checkup** | **X** | Checkup flag ← Can be cleared |

## 🔧 Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Reviewer Name | Judge | Your name for reviews |
| Overdue Threshold | 3 months | When to flag as needing review |
| Inactive Threshold | 6 months | When to flag as inactive |

## 🐛 Troubleshooting

### "Not connected" error
1. Make sure you've set up Google Cloud credentials (see Step 2)
2. Check that your Client ID is correctly added to manifest.json
3. Reload the extension at `edge://extensions/`

### "Authentication failed"
1. Make sure your email is added as a test user in Google Cloud Console
2. Try removing and re-adding the extension
3. Clear your browser cache and try again

### Side panel not opening
1. Make sure you're on a Google Sheets page
2. Try refreshing the page
3. Check `edge://extensions/` for any errors

### Data not loading
1. Verify your Sheet ID is correct
2. Make sure you have edit access to the spreadsheet
3. Check the browser console for error messages

## 🔮 Future Enhancements

- [ ] YouTube API integration for auto-fetching stats
- [ ] Twitch API integration
- [ ] Export review reports
- [ ] Custom hotkey configuration
- [ ] Email notifications for overdue reviews
- [ ] Team collaboration features

## 📄 License

MIT License - Feel free to modify and use for your team!

## 💜 Credits

Made with 💜 for the Hypixel Creator Team by Judge

---

**Need help?** Open an issue or contact Judge!
