const express = require('express');
const controller = require('../../controllers/activityApiController');
const { requireAuth } = require('../../middleware/auth');
const { activityRules, idRule, listRules, handleValidation } = require('../../middleware/validation');

const router = express.Router();

router.get('/', listRules, handleValidation, controller.list);
/* #swagger.tags = ['Activities']
   #swagger.summary = 'List activities'
   #swagger.parameters['category'] = { in: 'query', type: 'string', required: false }
   #swagger.parameters['status'] = { in: 'query', type: 'string', required: false }
   #swagger.responses[200] = { schema: [{ $ref: '#/definitions/Activity' }] }
   #swagger.responses[400] = { schema: { $ref: '#/definitions/Error' } } */

router.get('/:id', idRule, handleValidation, controller.getOne);
/* #swagger.tags = ['Activities']
   #swagger.summary = 'Get one activity'
   #swagger.responses[200] = { schema: { $ref: '#/definitions/Activity' } }
   #swagger.responses[404] = { schema: { $ref: '#/definitions/Error' } } */

router.post('/', requireAuth, activityRules, handleValidation, controller.create);
/* #swagger.tags = ['Activities']
   #swagger.summary = 'Create an activity (login required)'
   #swagger.security = [{ "cookieAuth": [] }]
   #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/ActivityInput' } }
   #swagger.responses[201] = { schema: { $ref: '#/definitions/Activity' } }
   #swagger.responses[400] = { schema: { $ref: '#/definitions/Error' } }
   #swagger.responses[401] = { schema: { $ref: '#/definitions/Error' } } */

router.put('/:id', requireAuth, idRule, activityRules, handleValidation, controller.update);
/* #swagger.tags = ['Activities']
   #swagger.summary = 'Update an owned activity (admin may update any)'
   #swagger.security = [{ "cookieAuth": [] }]
   #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/ActivityInput' } }
   #swagger.responses[200] = { schema: { $ref: '#/definitions/Activity' } }
   #swagger.responses[403] = { schema: { $ref: '#/definitions/Error' } } */

router.delete('/:id', requireAuth, idRule, handleValidation, controller.remove);
/* #swagger.tags = ['Activities']
   #swagger.summary = 'Delete an owned activity (admin may delete any)'
   #swagger.security = [{ "cookieAuth": [] }]
   #swagger.responses[204] = { description: 'Deleted' }
   #swagger.responses[403] = { schema: { $ref: '#/definitions/Error' } } */

router.post('/:id/volunteer', requireAuth, idRule, handleValidation, controller.volunteer);
/* #swagger.tags = ['Volunteers']
   #swagger.summary = 'Volunteer for an activity'
   #swagger.security = [{ "cookieAuth": [] }]
   #swagger.responses[200] = { schema: { $ref: '#/definitions/Activity' } }
   #swagger.responses[409] = { schema: { $ref: '#/definitions/Error' } } */

router.delete('/:id/volunteer', requireAuth, idRule, handleValidation, controller.unvolunteer);
/* #swagger.tags = ['Volunteers']
   #swagger.summary = 'Remove the current user volunteer signup'
   #swagger.security = [{ "cookieAuth": [] }]
   #swagger.responses[200] = { schema: { $ref: '#/definitions/Activity' } }
   #swagger.responses[404] = { schema: { $ref: '#/definitions/Error' } } */

module.exports = router;
