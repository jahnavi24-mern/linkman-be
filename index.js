require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/dbConfig");
const authRoute = require('./routes/authRoute');
const linkRoute = require("./routes/linkRoute");
const analyticsRoute  = require("./routes/analyticRoute");
const redirectRoute = require("./routes/redirectRoute");


async function startServer() {
    try {
      await connectDB(process.env.MONGO_URI);
      const app = express();
  
      app.use(express.json());
  
      app.use(
        cors({
          origin: '*',
          methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          allowedHeaders: ['Content-Type', 'Authorization'],
          credentials: true,
        })
      )
      app.use("/api/auth", authRoute);
      app.use("/api/link", linkRoute);
      app.use("/api/analytics", analyticsRoute);
      app.use("/", redirectRoute);
  
      const PORT = process.env.PORT || 4000;
  
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });
    } catch (error) {
      console.log("Error", error);
    }
  }
  
  startServer();