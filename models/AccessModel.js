// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
const { Schema, default: mongoose } = require("mongoose");

const accessSchema = new Schema({
  sessionId: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("access", accessSchema);
