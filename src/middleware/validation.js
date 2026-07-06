const { body, param, query, validationResult } = require('express-validator');
const { ACTIVITY_CATEGORIES, ACTIVITY_STATUSES } = require('../models/Activity');

const activityRules = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 120 }),
  body('description').trim().notEmpty().withMessage('Description is required.').isLength({ max: 2000 }),
  body('category').isIn(ACTIVITY_CATEGORIES).withMessage('Choose a valid category.'),
  body('date').isISO8601({ strict: true }).withMessage('Enter a valid date.').custom((value) => {
    const submitted = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (submitted < today) throw new Error('Date must be today or in the future.');
    return true;
  }),
  body('time').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Enter a valid time.'),
  body('location').trim().notEmpty().withMessage('Location is required.').isLength({ max: 200 }),
  body('organizer').trim().notEmpty().withMessage('Organizer is required.').isLength({ max: 100 }),
  body('status').isIn(ACTIVITY_STATUSES).withMessage('Choose a valid status.'),
  body('volunteersNeeded').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Volunteers needed must be a non-negative whole number.')
];

const idRule = [param('id').isMongoId().withMessage('Invalid activity id.')];
const listRules = [
  query('category').optional().isIn(ACTIVITY_CATEGORIES),
  query('status').optional().isIn(ACTIVITY_STATUSES)
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = errors.array().map((error) => ({ field: error.path, message: error.msg }));
  if (req.originalUrl.startsWith('/api/')) return res.status(400).json({ error: 'Validation failed.', details });
  return res.status(400).render('activity-form', {
    title: req.params.id ? 'Edit Activity' : 'Create Activity',
    activity: { ...req.body, _id: req.params.id }, errors: details,
    categories: ACTIVITY_CATEGORIES, statuses: ACTIVITY_STATUSES
  });
}

module.exports = { activityRules, idRule, listRules, handleValidation };
