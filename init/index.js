require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../MODELS/listings");
const { data } = require("./data");
(async () => {
  //const uri = process.env.MONGODB_URI 
  const uri = process.env.ATLASDB_URL 
  await mongoose.connect(uri);
  await Listing.deleteMany({});
  await Listing.insertMany(data.map((listing) => ({ ...listing, owner: undefined })));
  console.log(`Seeded ${data.length} listings.`);
  await mongoose.disconnect();
})().catch((err) => { console.error(err); process.exit(1); });
