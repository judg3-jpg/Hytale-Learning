# Moderator Statistics Dashboard

A comprehensive web-based dashboard for Lead Community Managers to track and analyze moderator performance metrics.

## Features

- **20 Moderator Cards**: Display comprehensive statistics for each moderator
- **12-Month Historical Data**: Track performance trends over time
- **Data Entry Interface**: Easy monthly stats entry with validation
- **Analytics & Reports**: Detailed analytics, comparisons, and export capabilities
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser to `http://localhost:3000`

## Usage

### Adding Moderators
Click the "Add Moderator" button in the header to create a new moderator profile.

### Entering Monthly Stats
1. Click "Add Stats" button
2. Select moderator from dropdown
3. Choose month and year
4. Enter all metrics (reports, hours, punishments, etc.)
5. Save the entry

### Viewing Analytics
- Click on any moderator card to view detailed analytics
- Use the filters to search and filter moderators
- Export data as CSV or view detailed reports

## Database

The dashboard uses SQLite (sql.js) for data storage. The database file (`moderator_stats.db`) is created automatically in the `server/database/` directory when the server starts.

## API Endpoints

- `GET /api/moderators` - Get all moderators
- `POST /api/moderators` - Create new moderator
- `GET /api/stats` - Get dashboard overview stats
- `POST /api/stats` - Create/update monthly stats
- `GET /api/analytics/trends` - Get team trends

See the plan for complete API documentation.

