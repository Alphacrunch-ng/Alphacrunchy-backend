const express = require("express");
// const session = require('express-session');
const passport = require('passport');
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const mongodb = require("./utils/db.js");
const rfs = require("rotating-file-stream");
const useragent = require("express-useragent");

const indexRoute = require("./routes/indexRoute");
const socket = require("./utils/socket.js");
const { authRoles, auth } = require("./middlewares/auth.js");
const { roles } = require("./utils/constants.js");

const app = express();
// app.use(cors({ origin: "*" }));
app.options('*', cors({
  headers: ['Content-Type', 'Authorization'], // sets the Access-Control-Allow-Headers header
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'] // sets the Access-Control-Allow-Methods header
}))
app.use(cors({
  origin: [
    "https://cambio.ng",
    "https://admin-alpha-crunch.netlify.app",
    "http://localhost:3001",
    "http://localhost:3000", "*"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Accept-Language", "Accept-Encoding"],
  exposedHeaders: ["Content-Type", "Authorization", "Accept", "Accept-Language", "Accept-Encoding"],
}));
// app.use(session({ 
//   secret: 'your-secret-key', 
//   resave: false, 
//   saveUninitialized: false,
//   cookie: { secure: false } // secure should be true in production with HTTPS
// }));

app.use(passport.initialize());
app.use(passport.session());
// app.use((req, res, next) => {
//   if (req.method === 'OPTIONS') {
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.status(200).send();
//   } else {
//     next();
//   }
// });
const http = require("http").createServer(app);
const port = process.env.PORT || 5001;

//middlewares
app.use(express.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", express.static("public"));
const logDirectory = path.join(__dirname, "log");
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating write stream
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: logDirectory,
});

// Serve the logs folder as a static directory
app.use("/logs", express.static(logDirectory));

if (process.env.NODE_ENV === "production") {
  // create a write stream for logging to file
  app.use(morgan("combined", { stream: accessLogStream }));
} else {
  app.use(morgan("combined", { stream: accessLogStream }));
  app.use(morgan("dev"));
}


app.get("/logs", auth, authRoles(roles.admin), (req, res) => {
  fs.readdir(logDirectory, (err, files) => {
    if (err) {
      console.error("Error reading logs directory", err);
      res.status(500).send("Internal Server Error");
    } else {
      const fileLinks = files.map((file) => {
        const filePath = path.join(logDirectory, file);
        const fileUrl = `/logs/${file}`;
        return `<a href="${fileUrl}">${file}</a>`;
      });
      const html = `<h1>Log Files</h1>${fileLinks.join("<br>")}`;
      res.send(html);
    }
  });
});

mongodb()
  .then(() => {
    // app.use(cors({ origin: "*" }));
    // Middleware to parse user-agent information
    app.use(useragent.express());
    app.options('*', cors());
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
    http.listen(port);
    http.on("listening", () => {
      console.log(`Server started on http://localhost:${port}`);
    });
    http.on("error", (e) => {
      if (e.code === "EADDRINUSE") {
        console.log("Address in use, retrying...");
        setTimeout(() => {
          http.close();
          http.listen(port);
        }, 1000);
      }
    });
  })
  .catch((error) => {
    console.log(error.message);
  });