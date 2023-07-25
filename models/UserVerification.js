const { model, Schema } = require("mongoose");

const userVerificationSchema = new Schema(
  {
    userId: String,
    uniqueString: String,
  },
  { timestamps: true }
);

module.exports = model("UserVerification", userVerificationSchema);
