module.exports = checkAuth = function (req, res, next) {
    if(req.session.Authed == true) {
      next();
    } else {
      res.redirect('login');
    }
}
