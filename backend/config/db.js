const { MongoClient } = require('mongodb');

// All records the secretariat creates (members, applications, enquiries) live in MongoDB,
// so they survive Render redeploys and restarts. Set MONGODB_URI in the environment.

let client;
let db;

async function connect() {
  if (db) return db;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add your MongoDB Atlas connection string to the environment (see .env.example).');
  }
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  db = client.db(process.env.MONGODB_DB || 'nnpa');

  // indexes (safe to run on every start)
  await db.collection('members').createIndex({ id: 1 }, { unique: true });
  await db.collection('members').createIndex({ serviceNoKey: 1 }, { unique: true });
  await db.collection('applications').createIndex({ id: 1 }, { unique: true });
  await db.collection('enquiries').createIndex({ id: 1 }, { unique: true });
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not connected yet');
  return db;
}

// atomic auto-increment so ids stay simple numbers (1, 2, 3…) even with simultaneous signups
async function nextId(name) {
  const doc = await getDb().collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return doc.seq;
}

// never leak Mongo's internal fields to the browser
function strip(doc) {
  if (!doc) return doc;
  const { _id, serviceNoKey, ...rest } = doc;
  return rest;
}

module.exports = { connect, getDb, nextId, strip };
