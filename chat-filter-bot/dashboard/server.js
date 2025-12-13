/**
 * Dashboard Server
 * Express.js server for the Chat Filter Bot dashboard
 */

const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', apiRoutes);

// Serve dashboard for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
function startDashboard() {
    return new Promise((resolve) => {
        const server = app.listen(PORT, () => {
            console.log(`🌐 Dashboard running at http://localhost:${PORT}`);
            resolve(server);
        });
    });
}

module.exports = { app, startDashboard };
