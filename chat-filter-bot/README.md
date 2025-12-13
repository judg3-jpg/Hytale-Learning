# 🛡️ Chat Filter Bot

A powerful Discord bot with regex-based chat filtering. Monitor messages in real-time and automatically take action based on configurable patterns.

## ✨ Features

- **Regex Filtering** - Create custom filters using regular expressions
- **Multiple Actions** - Delete, warn, timeout, kick, or ban offenders
- **Pre-built Presets** - Quickly add common filters (invites, links, spam, etc.)
- **Whitelist System** - Bypass filters for specific roles or channels
- **Edit Detection** - Catches users who edit messages to add filtered content
- **Logging** - Track all filter violations with detailed logs
- **Statistics** - View filter performance and user violations

## 📋 Commands

| Command | Description |
|---------|-------------|
| `/filter-add` | Add a new regex filter |
| `/filter-remove` | Remove a filter by ID |
| `/filter-list` | List all configured filters |
| `/filter-toggle` | Enable/disable a filter |
| `/filter-test` | Test a message against filters |
| `/filter-info` | Get details about a filter |
| `/filter-preset` | Add pre-built filter presets |
| `/filter-stats` | View filter statistics |
| `/filter-reload` | Reload filters from database |
| `/whitelist` | Manage role/channel whitelist |

## 🚀 Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A Discord Bot Application

### 1. Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section
4. Click "Add Bot"
5. **Important:** Enable these Privileged Gateway Intents:
   - `MESSAGE CONTENT INTENT` ✅
   - `SERVER MEMBERS INTENT` ✅
6. Copy your bot token (keep it secret!)

### 2. Install Dependencies

```bash
cd chat-filter-bot
npm install
```

### 3. Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   GUILD_ID=your_server_id_here
   LOG_CHANNEL_ID=optional_log_channel_id
   OWNER_ID=your_discord_id
   ```

   **How to get IDs:**
   - Enable Developer Mode in Discord (Settings → App Settings → Advanced)
   - Right-click on server/channel/user → "Copy ID"

### 4. Invite the Bot

1. Go to Developer Portal → Your App → OAuth2 → URL Generator
2. Select scopes: `bot`, `applications.commands`
3. Select permissions:
   - Manage Messages
   - Send Messages
   - Embed Links
   - Read Message History
   - Moderate Members (for timeout)
   - Kick Members (if using kick action)
   - Ban Members (if using ban action)
4. Copy the generated URL and open it to invite the bot

### 5. Start the Bot

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## 📝 Usage Examples

### Creating a Filter

Block Discord invite links:
```
/filter-add pattern:discord\.gg\/\w+ name:No Invites action:delete
```

Block excessive caps:
```
/filter-add pattern:^[A-Z\s]{20,}$ name:No Caps Spam action:warn
```

### Using Presets

List available presets:
```
/filter-preset
```

Add the Discord invites preset:
```
/filter-preset preset:discordInvites action:delete
```

### Managing Whitelist

Whitelist a moderator role:
```
/whitelist add-role role:@Moderators
```

Whitelist a channel:
```
/whitelist add-channel channel:#bot-commands
```

### Testing Filters

Test if a message would be filtered:
```
/filter-test message:Join my server discord.gg/test
```

## 📦 Pre-built Presets

| Preset | Description |
|--------|-------------|
| `discordInvites` | Blocks Discord invite links |
| `links` | Blocks all HTTP/HTTPS links |
| `massMentions` | Blocks @everyone, @here, mass mentions |
| `excessiveCaps` | Blocks messages in all caps |
| `repeatedChars` | Blocks spammy repeated characters |
| `zalgo` | Blocks glitchy zalgo text |
| `scamLinks` | Blocks common scam phrases |
| `ipAddresses` | Blocks IP address patterns |
| `phoneNumbers` | Blocks phone number patterns |

## 🔧 Configuration

Environment variables in `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | ✅ | Your bot token |
| `GUILD_ID` | ✅ | Your server's ID |
| `LOG_CHANNEL_ID` | ❌ | Channel for filter logs |
| `OWNER_ID` | ❌ | Your Discord user ID |

## 📁 Project Structure

```
chat-filter-bot/
├── src/
│   ├── index.js          # Entry point
│   ├── bot.js            # Discord client setup
│   ├── config.js         # Configuration
│   ├── database/
│   │   ├── db.js         # Database operations
│   │   └── schema.sql    # Table definitions
│   ├── filters/
│   │   ├── FilterEngine.js  # Regex matching
│   │   └── presets.js       # Pre-built patterns
│   ├── commands/         # Slash commands
│   ├── events/           # Event handlers
│   └── utils/            # Utilities
├── data/                 # Database files
├── .env                  # Configuration (secret!)
└── package.json
```

## 🤝 Contributing

Feel free to submit issues and pull requests!

## 📄 License

MIT License - feel free to use this bot for your own server!

---

Made with ❤️ for Discord communities
