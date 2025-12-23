/**
 * Verify database file directly
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'moderator_stats.db');

async function verifyDatabase() {
    try {
        const SQL = await initSqlJs();
        
        if (!fs.existsSync(DB_PATH)) {
            console.log('❌ Database file does not exist!');
            return;
        }
        
        const fileBuffer = fs.readFileSync(DB_PATH);
        const db = new SQL.Database(fileBuffer);
        
        const results = db.exec('SELECT * FROM moderators ORDER BY name');
        
        if (results.length === 0 || results[0].values.length === 0) {
            console.log('❌ Database file exists but has no moderators!');
        } else {
            const moderators = results[0].values.map(row => ({
                id: row[0],
                name: row[1],
                notes: row[7] || 'N/A'
            }));
            
            console.log(`\n✅ Database file has ${moderators.length} moderators:\n`);
            moderators.forEach((mod, i) => {
                console.log(`${i + 1}. ${mod.name} - ${mod.notes}`);
            });
        }
        
        db.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

verifyDatabase();



