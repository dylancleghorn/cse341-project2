const express = require('express');
const passport = require('passport');

const router = express.Router();
const isProduction = process.env.NODE_ENV === 'production';
const sessionCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/'
};

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/?login=failed' }),
  (req, res) => {
    const destination = req.session.returnTo || '/api-docs';
    delete req.session.returnTo;
    res.redirect(destination);
  });
router.post('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);
    if (!req.session) {
      res.clearCookie('ward.sid', sessionCookieOptions);
      return res.redirect('/api-docs');
    }
    return req.session.destroy((destroyError) => {
      if (destroyError) return next(destroyError);
      res.clearCookie('ward.sid', sessionCookieOptions);
      return res.redirect('/api-docs');
    });
  });
});

module.exports = router;
