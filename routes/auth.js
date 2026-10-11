const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../MODELS/user");
const { requireLogin } = require("../middleware");
const router = express.Router();

router.get("/register", (req, res) => res.render("users/register"));
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.register(new User({ username, email }), password);
    req.login(user, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/register");
  }
});

router.get("/login", (req, res) => res.render("users/login"));
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    const destination = req.session.returnTo || "/listings";
    delete req.session.returnTo;
    res.redirect(destination);
  },
);
router.post("/logout", requireLogin, (req, res, next) =>
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You have signed out.");
    res.redirect("/listings");
  }),
);

// Exchange valid local credentials for a short-lived bearer token for JSON clients.
router.post("/api/auth/token", (req, res, next) =>
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ error: "Invalid username or password." });
    const token = jwt.sign(
      { sub: String(user._id), username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.json({ token, tokenType: "Bearer", expiresIn: 3600 });
  })(req, res, next),
);
router.get("/api/auth/me", requireLogin, (req, res) =>
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
  }),
);

module.exports = router;
