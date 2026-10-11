const jwt = require("jsonwebtoken");
const ExpressError = require("./utils/ExpressError");

function requireLogin(req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "Please sign in to continue.");
    return res.redirect("/login");
  }
  next();
}

function requireOwner(req, res, next) {
  //  New comparison checking the exact ID property
if (!req.user || !res.locals.currentListing?.owner || String(req.user._id) !== String(res.locals.currentListing.owner._id)) {

    return next(new ExpressError(403, "You can only change listings you created."));
  }
  next();
}


function requireJwt(req, res, next) {
  const token = (req.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "A bearer token is required." });
  try {
    req.apiUser = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "The token is invalid or expired." });
  }
}

module.exports = { requireLogin, requireOwner, requireJwt };
