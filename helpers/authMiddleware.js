module.exports = checkAuth = function (req, res, next) {
  // If we have recorded this session as an authorised one
  if (req.session.Authed == true) {
    // Let the user continue to their desired route
    next();
  } else {
    // If not, return the user to the Login page with a 401 code.
    console.log('Not authed');
    res.status(401);
    res.redirect('/login');
  }
};
