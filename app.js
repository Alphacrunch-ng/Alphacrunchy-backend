const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const useragent = require("express-useragent");
const indexRoute = require("./routes/indexRoute");
const { logger, logDirectory } = require("./utils/logger/logger.js");

const app = express();
app.options('*', cors({
  headers: ['Content-Type', 'Authorization', '*'], // sets the Access-Control-Allow-Headers header
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE', '*'] // sets the Access-Control-Allow-Methods header
}))
app.use(cors({
  origin: [
    "https://cambio.ng",
    "https://admin-alpha-crunch.netlify.app",
    "http://localhost:3001",
    "http://localhost:3000", "*"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Accept-Language", "Accept-Encoding", "*"],
  exposedHeaders: ["Content-Type", "Authorization", "Accept", "Accept-Language", "Accept-Encoding", "*"],
}));

//middlewares
app.use(express.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", express.static("public"));


// Serve the logs folder as a static directory
app.use("/logs", express.static(logDirectory));

if (process.env.NODE_ENV === "production") {
  // create a write stream for logging to file
  app.use(logger.prod);
} else {
  app.use(logger.dev);
}
// app.use(cors({ origin: "*" }));
// Middleware to parse user-agent information
app.use(useragent.express());
app.use("/", indexRoute);
app.use((req, res, next) => {
  next(new Error((message = "Route Not found")));
});

app.use((error, req, res, next) => {
  return res.status(404).json({
    status: "failed",
    message: error.message,
  });
});

module.exports = app;