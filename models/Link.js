const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
    originaLink: {
        type: String,
        required: true,
    },
    shortLink: {
        type: String,
        required: true,
    },
    remarks: {
        type: String,
        required: true,
    },
    clicks: {
        type: Number,
        default: 0,
    },
    linkExpiration: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

});

module.exports = mongoose.model("Link", linkSchema);