const express = require("express");
const Listing = require("../MODELS/listings");
const { requireJwt } = require("../middleware");
const { listingSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const router = express.Router();
router.get("/listings", async (req, res, next) => {
  try { res.json(await Listing.find().populate("owner", "username")); } catch (err) { next(err); }
});
router.post("/listings", requireJwt, async (req, res, next) => {
  try {
    const input = req.body.listing ? req.body : { listing: req.body };
    const { error } = listingSchema.validate(input);
    if (error) throw new ExpressError(400, error.details[0].message);
    const listing = new Listing(input.listing);
    listing.owner = req.apiUser.sub;
    await listing.save(); res.status(201).json(listing);
  } catch (err) { next(err); }
});
module.exports = router;
