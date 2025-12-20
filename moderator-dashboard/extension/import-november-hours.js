/**
 * Import November Hours for Moderators
 * Run this in the browser console on the dashboard page
 */

const novemberHours = {
    'Gerbor': 100,
    'Smoarzified': 111,
    'SaltyLia': 100,
    'Gainful': 122,
    'Rhune': 128,
    'Changitesz': 116,
    'MCVisuals': 135,
    'LeBrilliant': 74,
    'Quack': 66,
    'AmyTheMudkip': 105,
    'DeluxeRose': 180,
    'Blake': 80,
    'Alexa': 80,
    'Jade': 90
};

async function importNovemberHours() {
    const year = 2024;
    const month = 11; // November
    
    // Get all moderators from IndexedDB
    const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('ModeratorDashboard', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    
    const transaction = db.transaction(['moderators'], 'readonly');
    const store = transaction.objectStore('moderators');
    const moderators = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    
    const statsTransaction = db.transaction(['stats'], 'readwrite');
    const statsStore = statsTransaction.objectStore('stats');
    const yearMonthIndex = statsStore.index('year_month');
    
    let imported = 0;
    let updated = 0;
    let notFound = [];
    
    for (const [name, hours] of Object.entries(novemberHours)) {
        const moderator = moderators.find(m => m.name === name);
        
        if (!moderator) {
            notFound.push(name);
            console.log(`❌ Moderator not found: ${name}`);
            continue;
        }
        
        const key = [moderator.id, year, month];
        const checkRequest = yearMonthIndex.get(key);
        
        checkRequest.onsuccess = () => {
            if (checkRequest.result) {
                // Update existing
                const existing = checkRequest.result;
                existing.hours_worked = hours;
                existing.updated_at = new Date().toISOString();
                const updateRequest = statsStore.put(existing);
                updateRequest.onsuccess = () => {
                    updated++;
                    console.log(`✅ Updated: ${name} - ${hours} hours`);
                };
            } else {
                // Create new
                const statsData = {
                    moderator_id: moderator.id,
                    year: year,
                    month: month,
                    reports_handled: 0,
                    hours_worked: hours,
                    punishments_issued: 0,
                    warnings_issued: 0,
                    mutes_issued: 0,
                    kicks_issued: 0,
                    bans_issued: 0,
                    appeals_reviewed: 0,
                    tickets_resolved: 0,
                    quality_score: null,
                    response_time_avg: null,
                    notes: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                const addRequest = statsStore.add(statsData);
                addRequest.onsuccess = () => {
                    imported++;
                    console.log(`✅ Imported: ${name} - ${hours} hours`);
                };
            }
        };
    }
    
    setTimeout(() => {
        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Imported: ${imported}`);
        console.log(`   🔄 Updated: ${updated}`);
        if (notFound.length > 0) {
            console.log(`   ❌ Not Found: ${notFound.join(', ')}`);
        }
        console.log(`\n🎉 November hours imported! Refresh the page to see updates.`);
    }, 1000);
}

// Run the import
importNovemberHours();

