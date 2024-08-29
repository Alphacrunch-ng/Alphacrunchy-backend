const fs = require('fs');
const path = require('path');
const { logDirectory } = require('./logger');

const readLogs = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(logDirectory, (err, files) => {
      if (err) {
        reject("Error reading logs directory: " + err);
      } else {
        resolve(files);
      }
    });
  });
};

const deleteLogs = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(logDirectory, (err, files) => {
      if (err) {
        reject("Error reading logs directory: " + err);
      } else {
        const deletePromises = files.map((file) => {
          return new Promise((resolve, reject) => {
            const filePath = path.join(logDirectory, file);
            fs.unlink(filePath, (err) => {
              if (err) {
                reject("Error deleting log file: " + err);
              } else {
                resolve();
              }
            });
          });
        });

        Promise.all(deletePromises)
          .then(() => resolve("Logs deleted successfully"))
          .catch(reject);
      }
    });
  });
};

module.exports = {
  readLogs,
  deleteLogs
};
