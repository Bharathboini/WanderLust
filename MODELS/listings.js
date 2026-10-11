const mongoose = require("mongoose");
const Review = require("./review");
const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: {
      filename: { type: String, default: "listingimage" },
      url: {
        type: String,
        default: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b",
      },
    },
    price: { type: Number, required: true, min: 0 },
    location: { type: String, required: true },
    country: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true },
);
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) await Review.deleteMany({ _id: { $in: listing.reviews } });
});
module.exports = mongoose.model("Listing", listingSchema);
