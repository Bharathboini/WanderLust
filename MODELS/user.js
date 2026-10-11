const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true },
);
userSchema.plugin(passportLocalMongoose, {
  usernameField: "username",
  usernameLowerCase: true,
});
module.exports = mongoose.model("User", userSchema);
