const { Schema } = require("mongoose");
const { dbConn } = require("../../system/db/mongo");
const objectId = Schema.ObjectId;

const passwordSchema = new Schema(
  {
    _id: {
      type: objectId,
      required: true,
    },
    secretKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Password = dbConn.model("Password", passwordSchema, "passwords");

module.exports = Password;
