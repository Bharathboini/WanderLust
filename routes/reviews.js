const express = require("express");
const Listing = require("../MODELS/listings");
const Review = require("../MODELS/review");
const { requireLogin } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schema");
const router = express.Router({ mergeParams: true });
router.post("/", requireLogin, wrapAsync(async (req, res) => {
  const { error } = reviewSchema.validate(req.body); if (error) throw new ExpressError(400, error.details[0].message);
  const listing = await Listing.findById(req.params.id); if (!listing) throw new ExpressError(404, "Listing not found.");
  const review = new Review(req.body.review); review.author = req.user._id; listing.reviews.push(review);
  await review.save(); await listing.save(); req.flash("success", "Thanks for your review!"); res.redirect(`/listings/${listing._id}`);
}));
router.delete("/:reviewId", requireLogin, wrapAsync(async (req, res) => {
  const review = await Review.findById(req.params.reviewId); if (!review) throw new ExpressError(404, "Review not found.");
  if (String(review.author) !== String(req.user._id)) throw new ExpressError(403, "You can only delete your own reviews.");
  await Listing.findByIdAndUpdate(req.params.id, { $pull: { reviews: review._id } }); await review.deleteOne();
  req.flash("success", "Review deleted."); res.redirect(`/listings/${req.params.id}`);
}));
module.exports = router;
