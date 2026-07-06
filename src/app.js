const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const methodOverride = require('method-override');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger-output.json');

require('./config/passport');

const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/api');
const webRoutes = require('./routes/webRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandlers');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7' }));
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.json({ limit: '20kb' }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

if (!process.env.SESSION_SECRET || !process.env.MONGODB_URI) {
  throw new Error('SESSION_SECRET and MONGODB_URI environment variables are required.');
}

app.use(session({
  name: 'ward.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.path = req.path;
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/', webRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
