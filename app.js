require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const helmet = require("helmet");
const User = require("./MODELS/user");
const Listing = require("./MODELS/listings");
const authRoutes = require("./routes/auth");
const listingRoutes = require("./routes/listings");
const reviewRoutes = require("./routes/reviews");
const apiRoutes = require("./routes/api");
const ExpressError = require("./utils/ExpressError");
const wrapAsync = require("./utils/wrapAsync");

const app = express();
const port = process.env.PORT || 8080;

//const mongoUrl = process.env.MONGODB_URI || 
// Keep your variable name exactly as you have it
const dbUrl = process.env.ATLASDB_URL;

if (!process.env.SESSION_SECRET || !process.env.JWT_SECRET) throw new Error("Set SESSION_SECRET and JWT_SECRET in the environment.");

app.engine("ejs", require("ejs-mate"));
app.set("view engine", "ejs"); app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); app.use(express.json());
app.use(methodOverride("_method"));

app.use(session({
  name: "wanderlust.sid", 
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false,
  // FIX: map your dbUrl variable to the required mongoUrl configuration key
  store: MongoStore.create({ mongoUrl: dbUrl, collectionName: "sessions", ttl: 14 * 24 * 60 * 60 }),
  cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 14 * 24 * 60 * 60 * 1000 }
}));

app.use(flash());
app.use(passport.initialize()); app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success"); res.locals.error = req.flash("error");
  next();
});

app.get("/", wrapAsync(async (req, res) => res.render("home", { listingCount: await Listing.countDocuments() })));
app.use(authRoutes);
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/api", apiRoutes);
app.use((req, res, next) => next(new ExpressError(404, "Page not found.")));
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  if (req.originalUrl.startsWith("/api/")) return res.status(status).json({ error: status === 500 ? "Internal server error." : err.message });
  res.status(status).render("listing/Error", { err: { statusCode: status, message: status === 500 ? "Something went wrong." : err.message } });
});

mongoose.connect(dbUrl).then(() => {
  console.log("Connected to MongoDB");
  app.listen(port, () => console.log(`Wanderlust listening on port ${port}`));
}).catch((err) => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
