/**
 * Quick script to check moderators in database
 */

const db = require('./db');

async function checkModerators() {
    try {
        await db.initDatabase();
        const moderators = db.getAllModerators();
        
        console.log(`\n📊 Total Moderators in Database: ${moderators.length}\n`);
        
        if (moderators.length === 0) {
            console.log('❌ No moderators found in database!');
        } else {
            moderators.forEach((mod, index) => {
                console.log(`${index + 1}. ${mod.name} - ${mod.notes || mod.rank || 'N/A'} (ID: ${mod.id}, Status: ${mod.status})`);
            });
        }
        
        db.closeDatabase();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkModerators();

