module.exports = checkAuth = function (req, res, next) {
  if (req.session.Authed == true) {
    next();
  } else {
    console.log('Not authed');
    res.status(401);
    res.redirect('/login');
  }
};
