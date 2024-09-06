require("dotenv").config();
const mongodb = require("./utils/db.js");
const app = require("./app.js")




const http = require("http").createServer(app);
const port = process.env.PORT || 5001;

mongodb()
  .then(() => {
    http.listen(port);
  })
  .catch((error) => {
    console.log(error.message);
  });

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
  