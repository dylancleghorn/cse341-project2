function wantsJson(req) {
  return req.originalUrl.startsWith('/api/');
}

function requireAuth(req, res, next) {
  if (req.isAuthenticated?.()) return next();
  if (wantsJson(req)) return res.status(401).json({ error: 'Authentication required.' });
  req.session.returnTo = req.originalUrl;
  return res.redirect('/auth/github');
}

function canManage(activity, user) {
  const ownerId = activity.createdBy?._id || activity.createdBy;
  return Boolean(user && (user.role === 'admin' || ownerId?.toString() === user.id));
}

module.exports = { requireAuth, canManage };
