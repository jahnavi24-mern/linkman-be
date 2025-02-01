const mongoose = require("mongoose");

const connectDB = async (uri) => {
    await mongoose.connect(uri, {
        dbName: "current",
    })

    console.log("MongoDB connected...")
}

module.exports = connectDB;