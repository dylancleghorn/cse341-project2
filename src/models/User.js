const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  oauthProvider: { type: String, required: true, enum: ['github'] },
  oauthId: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

userSchema.index({ oauthProvider: 1, oauthId: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
