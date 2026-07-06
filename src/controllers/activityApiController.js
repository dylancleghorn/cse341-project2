const Activity = require('../models/Activity');
const { canManage } = require('../middleware/auth');

const editableFields = [
  'title', 'description', 'category', 'date', 'time', 'location',
  'organizer', 'participantLimit', 'status'
];

function pickActivity(body) {
  return editableFields.reduce((result, field) => {
    if (body[field] !== undefined) result[field] = body[field];
    return result;
  }, {});
}

async function list(req, res, next) {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    const activities = await Activity.find(filter)
      .populate('createdBy', 'name email role').populate('participants', 'name email')
      .sort({ date: 1, time: 1 });
    res.json(activities);
  } catch (error) { next(error); }
}

async function getOne(req, res, next) {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('createdBy', 'name email role').populate('participants', 'name email');
    if (!activity) return res.status(404).json({ error: 'Activity not found.' });
    return res.json(activity);
  } catch (error) { return next(error); }
}

async function create(req, res, next) {
  try {
    const activity = await Activity.create({ ...pickActivity(req.body), createdBy: req.user.id });
    res.status(201).location(`/api/activities/${activity.id}`).json(activity);
  } catch (error) { next(error); }
}

async function update(req, res, next) {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found.' });
    if (!canManage(activity, req.user)) return res.status(403).json({ error: 'You may only edit activities you created.' });
    Object.assign(activity, pickActivity(req.body));
    await activity.save();
    return res.json(activity);
  } catch (error) { return next(error); }
}

async function remove(req, res, next) {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found.' });
    if (!canManage(activity, req.user)) return res.status(403).json({ error: 'You may only delete activities you created.' });
    await activity.deleteOne();
    return res.status(204).send();
  } catch (error) { return next(error); }
}

async function joinParticipants(req, res, next) {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found.' });
    if (['completed', 'cancelled'].includes(activity.status)) {
      return res.status(409).json({ error: 'This activity is not accepting participants.' });
    }
    if (activity.participants.some((id) => id.equals(req.user.id))) {
      return res.status(409).json({ error: 'You are already attending.' });
    }
    if (activity.participantLimit > 0 && activity.participants.length >= activity.participantLimit) {
      return res.status(409).json({ error: 'This activity is full.' });
    }
    activity.participants.push(req.user.id);
    if (activity.participantLimit > 0 && activity.participants.length >= activity.participantLimit) activity.status = 'full';
    await activity.save();
    return res.json(activity);
  } catch (error) { return next(error); }
}

async function leaveParticipants(req, res, next) {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found.' });
    const originalLength = activity.participants.length;
    activity.participants = activity.participants.filter((id) => !id.equals(req.user.id));
    if (activity.participants.length === originalLength) {
      return res.status(404).json({ error: 'You are not attending this activity.' });
    }
    if (activity.status === 'full') activity.status = 'open';
    await activity.save();
    return res.json(activity);
  } catch (error) { return next(error); }
}

module.exports = { list, getOne, create, update, remove, joinParticipants, leaveParticipants, pickActivity };
