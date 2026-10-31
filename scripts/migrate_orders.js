require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

async function migrate() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('mjs_corner');

  const orders = await db.collection('orders').find({}).sort({ createdAt: 1, timestamp: 1 }).toArray();
  console.log(`Found ${orders.length} orders in database.`);

  let num = 1;
  for (const order of orders) {
    const newId = `#MJ-${String(num).padStart(4, '0')}`;
    await db.collection('orders').updateOne({ _id: order._id }, { $set: { id: newId } });
    console.log(`Updated order ${order._id} to ${newId}`);
    num++;
  }

  await db.collection('counters').updateOne(
    { _id: 'order_number' },
    { $set: { seq: num - 1 } },
    { upsert: true }
  );

  console.log(`Initialized order counter sequence to ${num - 1}.`);
  await client.close();
}

migrate().catch(console.error);
