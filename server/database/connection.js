const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.DB_URI);

let dbConnection;

async function connect() {
  if (!dbConnection) {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    dbConnection = client.db(process.env.DB_NAME);
  }
  return dbConnection;
}

async function disconnect() {
  if (dbConnection) {
    await client.close();
    console.log("Disconnected from MongoDB");
    dbConnection = null; // Reset dbConnection to ensure it reflects the disconnected state
  }
}

module.exports = { connect, disconnect };