require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB Atlas URI (Use MONGODB_URI in .env or default)
const uri = process.env.MONGODB_URI || "mongodb+srv://mjscornerinfo_db_user:<db_password>@mjscorner.o55ympi.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let database = null;

async function connectToMongoDB() {
  try {
    if (uri.includes('<db_password>')) {
      console.warn("\n⚠️  [MongoDB Warning] '<db_password>' placeholder detected in connection string.");
      console.warn("👉 Please set MONGODB_URI in your .env file or replace <db_password> with your actual database password.\n");
    }
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ You successfully connected to MongoDB Atlas!");
    database = client.db("mjs_corner");
    return client;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message || err);
    throw err;
  }
}

function getDb(dbName = "mjs_corner") {
  if (!database) {
    database = client.db(dbName);
  }
  return database;
}

// Call this only when your application terminates
async function disconnectFromMongoDB() {
  try {
    if (client) {
      await client.close();
      console.log("🛑 Disconnected from MongoDB.");
    }
  } catch (err) {
    console.error("Error disconnecting from MongoDB:", err);
  }
}

module.exports = {
  client,
  connectToMongoDB,
  getDb,
  disconnectFromMongoDB
};
