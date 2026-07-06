const express = require('express');
const activityRoutes = require('./activityRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/activities', activityRoutes);
router.use('/users', userRoutes);

module.exports = router;
