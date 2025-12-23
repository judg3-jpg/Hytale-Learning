/**
 * Test API endpoint to see if moderators are being returned
 */

const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/moderators',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const moderators = JSON.parse(data);
            console.log(`\n📊 API Response: ${moderators.length} moderators\n`);
            moderators.forEach((mod, index) => {
                console.log(`${index + 1}. ${mod.name} - ${mod.notes || mod.rank || 'N/A'}`);
            });
        } catch (error) {
            console.error('Error parsing response:', error);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error connecting to server:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
});

req.end();



