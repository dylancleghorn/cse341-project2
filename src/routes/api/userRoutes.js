const express = require('express');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Return the authenticated user'
  // #swagger.security = [{ "cookieAuth": [] }]
  // #swagger.responses[200] = { schema: { $ref: '#/definitions/User' } }
  // #swagger.responses[401] = { schema: { $ref: '#/definitions/Error' } }
  res.json(req.user);
});

module.exports = router;
