const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/?login=failed' }),
  (req, res) => {
    const destination = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(destination);
  });
router.post('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);
    req.session.destroy(() => {
      res.clearCookie('ward.sid');
      res.redirect('/');
    });
  });
});

module.exports = router;
