const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

const adminEmails = () => (process.env.ADMIN_EMAILS || '')
  .split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || '/auth/github/callback',
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = (profile.emails?.find((item) => item.verified)?.value
        || profile.emails?.[0]?.value || '').toLowerCase();
      if (!email) return done(null, false, { message: 'GitHub did not provide an email address.' });

      const user = await User.findOneAndUpdate(
        { oauthProvider: 'github', oauthId: profile.id },
        {
          name: profile.displayName || profile.username,
          email,
          role: adminEmails().includes(email) ? 'admin' : 'user'
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    done(null, await User.findById(id));
  } catch (error) {
    done(error);
  }
});
