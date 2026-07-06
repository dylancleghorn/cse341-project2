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
      .populate('createdBy', 'name email role').populate('participants', 'name email');
    if (!activity) { const error = new Error('Activity not found.'); error.status = 404; throw error; }
    const isParticipating = Boolean(req.user && activity.participants.some((participant) => participant.id === req.user.id));
    res.render('activity-detail', { title: activity.title, activity, canManage: canManage(activity, req.user), isParticipating });
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

async function joinParticipants(req, res, next) {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) { const error = new Error('Activity not found.'); error.status = 404; throw error; }
    if (['completed', 'cancelled'].includes(activity.status)) { const error = new Error('This activity is not accepting participants.'); error.status = 409; throw error; }
    if (!activity.participants.some((id) => id.equals(req.user.id))) {
      if (activity.participantLimit > 0 && activity.participants.length >= activity.participantLimit) { const error = new Error('This activity is full.'); error.status = 409; throw error; }
      activity.participants.push(req.user.id);
      if (activity.participantLimit > 0 && activity.participants.length >= activity.participantLimit) activity.status = 'full';
      await activity.save();
    }
    res.redirect(`/activities/${activity.id}`);
  } catch (error) { next(error); }
}

async function leaveParticipants(req, res, next) {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) { const error = new Error('Activity not found.'); error.status = 404; throw error; }
    activity.participants = activity.participants.filter((id) => !id.equals(req.user.id));
    if (activity.status === 'full') activity.status = 'open';
    await activity.save();
    res.redirect(`/activities/${activity.id}`);
  } catch (error) { next(error); }
}

module.exports = { home, show, newForm, create, editForm, update, remove, joinParticipants, leaveParticipants };
