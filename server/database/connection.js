const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.DB_URI);

async function connect() {
  await client.connect();
  console.log("Connected successfully to MongoDB");
  return client.db(process.env.DB_NAME);
}

async function disconnect() {
  await client.close();
  console.log("Disconnected from MongoDB");
}

module.exports = { connect, disconnect };