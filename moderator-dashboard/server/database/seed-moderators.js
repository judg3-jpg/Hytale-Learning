/**
 * Seed script to add moderators to the database
 * Run: node server/database/seed-moderators.js
 */

const db = require('./db');
const path = require('path');

const moderators = [
    { name: 'Alexa', notes: 'SkyBlock Moderator', rank: 'Mod', status: 'active' },
    { name: 'AmyTheMudkip', notes: 'Report Moderator', rank: 'Mod', status: 'active' },
    { name: 'Blake', notes: 'SkyBlock Moderator', rank: 'Mod', status: 'active' },
    { name: 'Changitesz', notes: 'Report Moderator', rank: 'Mod', status: 'active' },
    { name: 'DeluxeRose', notes: 'Report Moderator', rank: 'Mod', status: 'active' },
    { name: 'Gainful', notes: 'Report Moderator', rank: 'Mod', status: 'active' },
    { name: 'Gerbor', notes: 'SkyBlock Moderator', rank: 'Mod', status: 'active' },
    { name: 'Jade', notes: 'Report Moderator', rank: 'Mod', status: 'active' },
    { name: 'LeBrilliant', notes: 'Report Moderator', rank: 'Mod', status: 'active' },
    { name: 'Quack', notes: 'Forum & Report Moderator', rank: 'Mod', status: 'active' },
    { name: 'Rhune', notes: 'SkyBlock Moderator', rank: 'Mod', status: 'active' },
    { name: 'SaltyLia', notes: 'Report & SkyBlock Moderator', rank: 'Mod', status: 'active' },
    { name: 'Smoarzified', notes: 'Appeals & SkyBlock Moderator', rank: 'Mod', status: 'active' },
    { name: 'MCVisuals', notes: 'Appeals & Report Moderator', rank: 'Mod', status: 'active' }
];

async function seedModerators() {
    try {
        console.log('🌱 Starting moderator seeding...\n');
        
        // Initialize database
        await db.initDatabase();
        console.log('✅ Database initialized\n');
        
        let created = 0;
        let updated = 0;
        let skipped = 0;
        
        for (const mod of moderators) {
            // Check if moderator already exists
            const existing = db.getAllModerators().find(m => 
                m.name.toLowerCase() === mod.name.toLowerCase()
            );
            
            if (existing) {
                // Update existing moderator
                const wasUpdated = db.updateModerator(existing.id, {
                    notes: mod.notes,
                    rank: mod.rank,
                    status: mod.status
                });
                if (wasUpdated) {
                    console.log(`🔄 Updated: ${mod.name} - ${mod.notes}`);
                    updated++;
                } else {
                    console.log(`⏭️  Skipped: ${mod.name} (no changes needed)`);
                    skipped++;
                }
            } else {
                // Create new moderator
                const id = db.createModerator(mod);
                console.log(`✅ Created: ${mod.name} - ${mod.notes} (ID: ${id})`);
                created++;
            }
        }
        
        console.log('\n📊 Summary:');
        console.log(`   ✅ Created: ${created}`);
        console.log(`   🔄 Updated: ${updated}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   📝 Total: ${moderators.length}`);
        
        // Verify the save
        const verify = db.getAllModerators();
        console.log(`\n✅ Verification: Database now has ${verify.length} moderators`);
        
        // Force save and close
        db.saveDatabase();
        console.log('💾 Database saved to file');
        
        db.closeDatabase();
        console.log('\n🎉 Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding moderators:', error);
        process.exit(1);
    }
}

seedModerators();

