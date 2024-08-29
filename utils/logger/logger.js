const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const rfs = require("rotating-file-stream");


const logDirectory = path.resolve(process.cwd(), "log");

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating write stream
const accessLogStream = rfs.createStream("access.log", {
    interval: "1d", // rotate daily
    path: logDirectory,
  });

exports.logDirectory = logDirectory;
exports.logger = {
    dev: morgan('dev'),
    prod: morgan('combined', { stream: accessLogStream })
}