const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["user", "venue_owner"],
    default: "user",
  },

  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  newEmail: { type: String },
  newEmailToken: { type: String },
  newEmailExpires: { type: Date },
  forgetPasswordToken: { type: String },
  forgetPasswordExpires: { type: Date },

  //pref
  preferences: {
    sports: [{ type: String }],
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    timeOfDay: [{ type: String, enum: ["morning", "day", "evening"] }],
    location: { type: String }, 
  },

  //events history
  attendedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  createdEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  savedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //return if password is not modified
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
