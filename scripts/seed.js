require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../src/config/database');
const User = require('../src/models/User');
const Activity = require('../src/models/Activity');

async function seed() {
  await connectDatabase();
  const user = await User.findOneAndUpdate(
    { oauthProvider: 'github', oauthId: 'seed-user' },
    { name: 'Seed Organizer', email: 'seed@example.com', role: 'user' },
    { upsert: true, new: true, runValidators: true }
  );
  await Activity.deleteMany({ createdBy: user.id });
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 14);
  date.setUTCHours(0, 0, 0, 0);
  await Activity.create([
    { title: 'Community Park Cleanup', description: 'Bring gloves and help clean the neighborhood park.', category: 'service project', date, time: '09:00', location: 'Riverside Park', organizer: 'Ward Service Committee', createdBy: user.id, volunteersNeeded: 15, status: 'open' },
    { title: 'Ward Summer Social', description: 'A casual outdoor dinner for ward members and neighbors.', category: 'ward social', date: new Date(date.getTime() + 7 * 86400000), time: '18:30', location: 'Meetinghouse lawn', organizer: 'Activities Committee', createdBy: user.id, volunteersNeeded: 6, status: 'planned' }
  ]);
  console.log('Seeded one user and two activities.');
  await mongoose.disconnect();
}

seed().catch(async (error) => { console.error(error); await mongoose.disconnect(); process.exit(1); });
