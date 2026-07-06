const Activity = require('../models/Activity');
const { ACTIVITY_CATEGORIES, ACTIVITY_STATUSES } = require('../models/Activity');
const { canManage } = require('../middleware/auth');
const { pickActivity } = require('./activityApiController');

async function home(req, res, next) {
  try {
    const activities = await Activity.find().populate('createdBy', 'name').sort({ date: 1, time: 1 });
    res.render('index', { title: 'Activities', activities });
  } catch (error) { next(error); }
}

async function show(req, res, next) {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('createdBy', 'name email role').populate('volunteers', 'name email');
    if (!activity) { const error = new Error('Activity not found.'); error.status = 404; throw error; }
    res.render('activity-detail', { title: activity.title, activity, canManage: canManage(activity, req.user) });
  } catch (error) { next(error); }
}

function newForm(req, res) {
  res.render('activity-form', {
    title: 'Create Activity', activity: { status: 'planned' }, errors: [],
    categories: ACTIVITY_CATEGORIES, statuses: ACTIVITY_STATUSES
  });
}

async function create(req, res, next) {
  try {
    const activity = await Activity.create({ ...pickActivity(req.body), createdBy: req.user.id });
    res.redirect(`/activities/${activity.id}`);
  } catch (error) { next(error); }
}

async function editForm(req, res, next) {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) { const error = new Error('Activity not found.'); error.status = 404; throw error; }
    if (!canManage(activity, req.user)) { const error = new Error('You may only edit activities you created.'); error.status = 403; throw error; }
    res.render('activity-form', {
      title: 'Edit Activity', activity, errors: [], categories: ACTIVITY_CATEGORIES, statuses: ACTIVITY_STATUSES
    });
  } catch (error) { next(error); }
}

async function update(req, res, next) {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) { const error = new Error('Activity not found.'); error.status = 404; throw error; }
    if (!canManage(activity, req.user)) { const error = new Error('You may only edit activities you created.'); error.status = 403; throw error; }
    Object.assign(activity, pickActivity(req.body));
    await activity.save();
    res.redirect(`/activities/${activity.id}`);
  } catch (error) { next(error); }
}

async function remove(req, res, next) {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) { const error = new Error('Activity not found.'); error.status = 404; throw error; }
    if (!canManage(activity, req.user)) { const error = new Error('You may only delete activities you created.'); error.status = 403; throw error; }
    await activity.deleteOne();
    res.redirect('/');
  } catch (error) { next(error); }
}

module.exports = { home, show, newForm, create, editForm, update, remove };
