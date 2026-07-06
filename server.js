require('dotenv').config();

const app = require('./src/app');
const connectDatabase = require('./src/config/database');

const port = process.env.PORT || 3000;

async function start() {
  await connectDatabase();
  app.listen(port, () => console.log(`Ward Activity Board listening on port ${port}`));
}

start().catch((error) => {
  console.error('Unable to start the application:', error.message);
  process.exit(1);
});
