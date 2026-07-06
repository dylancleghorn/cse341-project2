const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const Activity = require('../src/models/Activity');

async function verify() {
  const future = new Date();
  future.setUTCDate(future.getUTCDate() + 2);
  const valid = new Activity({
    title: 'Test activity', description: 'A valid test activity.', category: 'service project',
    date: future, time: '09:00', location: 'Test location', organizer: 'Test organizer',
    createdBy: new mongoose.Types.ObjectId(), participantLimit: 2, status: 'open'
  });
  await valid.validate();

  const invalid = new Activity({ ...valid.toObject(), title: '', participantLimit: -1, status: 'unknown' });
  await assert.rejects(() => invalid.validate(), (error) => Boolean(
    error.errors.title && error.errors.participantLimit && error.errors.status
  ));

  const views = path.join(process.cwd(), 'src', 'views');
  for (const file of fs.readdirSync(views).filter((name) => name.endsWith('.ejs'))) {
    ejs.compile(fs.readFileSync(path.join(views, file), 'utf8'), { filename: path.join(views, file) });
  }

  const swagger = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'swagger-output.json'), 'utf8'));
  const operationCount = Object.values(swagger.paths).reduce((count, route) => count + Object.keys(route).length, 0);
  assert.equal(operationCount, 8, 'Swagger must document all eight required API operations.');
  assert(swagger.paths['/activities/'].post.requestBody, 'Swagger POST must document its request body.');
  assert(swagger.paths['/activities/{id}'].put.security, 'Swagger PUT must document authentication.');
  console.log('Model validation, EJS syntax, and Swagger contract checks passed.');
}

verify().catch((error) => { console.error(error); process.exit(1); });
