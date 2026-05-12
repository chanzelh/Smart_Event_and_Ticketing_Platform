const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
    type: String,
    required: true,
    trim: true
    },

    category: {
      type: String,
      required: true,
      enum: ["Concert", "Conference", "Workshop", "Sports", "Other"]
    },

    ticketPrice: {
      type: Number,
      required: true,
      min: 0
    },

    totalCapacity: {
      type: Number,
      required: true,
      min: 1
    },

    availableTickets: {
      type: Number,
      required: true,
      min: 0
    },

    venueName: {
      type: String,
      required: true,
      trim: true
    },

    eventDateTime: {
      type: Date,
      required: true
    },

    artworkUrl: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Event", eventSchema);