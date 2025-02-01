const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
    link: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Link",
        required: true,
    },
    deviceType: {
        type: String,
        required: true,
    },
    browser: {
        type: String,
        required: true,
    },
    ipAddress: {
        type: String,
    },
    accessedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Analytics", analyticsSchema);
