require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../src/config/database');
const Activity = require('../src/models/Activity');

async function migrate() {
  await connectDatabase();
  const cursor = Activity.collection.find({
    $or: [{ volunteers: { $exists: true } }, { volunteersNeeded: { $exists: true } }]
  });
  let migrated = 0;
  for await (const document of cursor) {
    await Activity.collection.updateOne(
      { _id: document._id },
      {
        $set: {
          participants: document.participants || document.volunteers || [],
          participantLimit: document.participantLimit ?? document.volunteersNeeded ?? 0
        },
        $unset: { volunteers: '', volunteersNeeded: '' }
      }
    );
    migrated += 1;
  }
  console.log(`Migrated ${migrated} activities to participant fields.`);
  await mongoose.disconnect();
}

migrate().catch(async (error) => { console.error(error); await mongoose.disconnect(); process.exit(1); });
