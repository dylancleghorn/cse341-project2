const mongoose = require('mongoose');

const categories = [
  'service project', 'youth', 'relief society', 'elders quorum',
  'ward social', 'devotional', 'temple trip', 'community', 'other'
];
const statuses = ['planned', 'open', 'full', 'completed', 'cancelled'];

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: { type: String, required: true, enum: categories },
  date: {
    type: Date,
    required: true,
    validate: {
      validator(value) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return value >= today;
      },
      message: 'Date must be today or in the future.'
    }
  },
  time: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  location: { type: String, required: true, trim: true, maxlength: 200 },
  organizer: { type: String, required: true, trim: true, maxlength: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  volunteersNeeded: { type: Number, min: 0, default: 0 },
  volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: statuses, default: 'planned' }
}, { timestamps: true });

activitySchema.set('toJSON', { virtuals: true, versionKey: false });

module.exports = mongoose.model('Activity', activitySchema);
module.exports.ACTIVITY_CATEGORIES = categories;
module.exports.ACTIVITY_STATUSES = statuses;
