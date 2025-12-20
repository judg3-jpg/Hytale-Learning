# Installation Guide - Moderator Dashboard Extension

## Quick Installation Steps

### 1. Download from GitHub
- Go to: https://github.com/judg3-jpg/Hytale-Learning
- Click "Code" → "Download ZIP"
- Extract the ZIP file

### 2. Navigate to Extension Folder
After extracting, you should have this structure:
```
Hytale-Learning-master/
  └── moderator-dashboard/
      └── extension/          ← THIS is the folder you need!
          ├── manifest.json   ← Must be here
          ├── background.js
          ├── dashboard.html
          ├── standalone-dashboard.js
          ├── icons/
          └── sidepanel/
```

### 3. Load Extension in Browser

**For Chrome:**
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Navigate to and select the `extension` folder (NOT the moderator-dashboard folder)
   - Path should be: `.../moderator-dashboard/extension`
   - The manifest.json file should be directly inside this folder

**For Edge:**
1. Open Edge
2. Go to `edge://extensions/`
3. Enable "Developer mode" (toggle in top left)
4. Click "Load unpacked"
5. Navigate to and select the `extension` folder

### 4. Verify Installation
- You should see "Moderator Statistics Dashboard" in your extensions list
- Click the extension icon in your toolbar
- The dashboard should open in a new tab

## Common Errors

### "Manifest file is missing or unreadable"
**Problem:** You selected the wrong folder.

**Solution:** 
- Make sure you select the `extension` folder
- The `manifest.json` file must be directly inside the folder you select
- Do NOT select the `moderator-dashboard` folder - select the `extension` folder inside it

**Correct path structure:**
```
moderator-dashboard/
  └── extension/          ← Select THIS folder
      ├── manifest.json   ← This file must be here
      ├── background.js
      └── ...
```

**Wrong path:**
```
moderator-dashboard/      ← Don't select this!
  └── extension/
```

### Extension doesn't work
- Make sure all files are present in the extension folder
- Check browser console for errors (F12)
- Try removing and reloading the extension

## After Installation

1. Click the extension icon
2. Dashboard opens automatically
3. All 14 moderators are pre-loaded
4. No server needed - works completely offline!

## Features

✅ Works offline (no npm start needed)
✅ All 14 moderators pre-loaded
✅ Add/Edit moderators and stats
✅ Export data as CSV
✅ Dark/Light theme
✅ Fancy card design with MODERATOR tags

