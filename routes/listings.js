const express = require("express");
const Listing = require("../MODELS/listings");
const { listingSchema } = require("../schema");
const { requireLogin, requireOwner } = require("../middleware");
const ExpressError = require("../utils/ExpressError");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) return next(new ExpressError(400, error.details.map((d) => d.message).join(", ")));
  next();
};
const loadListing = wrapAsync(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id).populate({ path: "reviews", populate: { path: "author", select: "username" } }).populate("owner", "username");
  if (!listing) return next(new ExpressError(404, "Listing not found."));
  res.locals.currentListing = listing;
  next();
});

router.route("/")
  .get(wrapAsync(async (req, res) => res.render("listing/index", { allListings: await Listing.find().populate("owner", "username") })))
  .post(requireLogin, validateListing, wrapAsync(async (req, res) => {
    const listing = new Listing(req.body.listing);
    listing.owner = req.user._id;
    await listing.save(); req.flash("success", "Your listing is live!"); res.redirect(`/listings/${listing._id}`);
  }));

router.get("/new", requireLogin, (req, res) => res.render("listing/new"));
router.get("/:id/edit", loadListing, requireLogin, requireOwner, (req, res) => res.render("listing/edit", { editListing: res.locals.currentListing }));
router.get("/:id", loadListing, (req, res) => res.render("listing/show", { singleListing: res.locals.currentListing }));
router.put("/:id", loadListing, requireLogin, requireOwner, validateListing, wrapAsync(async (req, res) => {
  const listing = res.locals.currentListing;
  Object.assign(listing, req.body.listing);
  await listing.save(); req.flash("success", "Listing updated."); res.redirect(`/listings/${listing._id}`);
}));
router.delete("/:id", loadListing, requireLogin, requireOwner, wrapAsync(async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id); req.flash("success", "Listing deleted."); res.redirect("/listings");
}));

module.exports = router;
