const moment = require('moment');
const db = require('../database/connection');


async function cleanupUnverifiedUsers() {
    let conn;
    try {
        conn = await db.connect();
        const currentTime = moment().toISOString();
        const collection = conn.collection('students');
        
        // Delete users where expirationTime is in the past and they are not verified
        const result = await collection.deleteMany({
            expirationTime: { $lt: currentTime },
            verifiedItems: { $exists: false }
        });

        console.log(`${result.deletedCount} unverified users cleaned up.`);
        return result.deletedCount;
    } catch (err) {
        console.error("Failed to clean up unverified users:", err);
        throw err;
    }
}

//Run the cleanup function every 24 hours
//Put this setInterval somewhere in your server code where it will run like in app.js
//setInterval(cleanupUnverifiedUsers, 24 * 60 * 60 * 1000); 