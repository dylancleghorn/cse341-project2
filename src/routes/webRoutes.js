const express = require('express');
const controller = require('../controllers/webController');
const { requireAuth } = require('../middleware/auth');
const { activityRules, idRule, handleValidation } = require('../middleware/validation');

const router = express.Router();

router.get('/', controller.home);
router.get('/activities/new', requireAuth, controller.newForm);
router.post('/activities', requireAuth, activityRules, handleValidation, controller.create);
router.get('/activities/:id', idRule, handleValidation, controller.show);
router.get('/activities/:id/edit', requireAuth, idRule, handleValidation, controller.editForm);
router.put('/activities/:id', requireAuth, idRule, activityRules, handleValidation, controller.update);
router.delete('/activities/:id', requireAuth, idRule, handleValidation, controller.remove);

module.exports = router;
