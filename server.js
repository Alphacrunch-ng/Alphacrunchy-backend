const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');
require('dotenv').config();
const swaggerJsDoc = require('swagger-jsdoc');
const mongodb = require('./utils/db.js');
const rfs = require('rotating-file-stream');

const indexRoute = require('./routes/indexRoute');
const options = require('./utils/swaggerOptions');
const { connectChat } = require('./utils/services.js');
const socket = require('./utils/socket.js')

const app = express();
app.use(cors());
const http = require('http').createServer(app);
const io = socket.init(http, {
    cors: {
        origin: ["http://localhost:3001", "http://localhost:3000"],
        methods: ["GET", "POST"],
        allowedHeaders: ["alphacrun"],
        credentials: true
      }
});
const spec = swaggerJsDoc(options);
const port = process.env.PORT || 5001;

//middlewares
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(spec));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/',express.static('public'));
const logDirectory = path.join(__dirname, 'log');
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating write stream
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
});
if (process.env.NODE_ENV === 'production'){
    // create a write stream for logging to file
    app.use(morgan("combined",{ stream: accessLogStream }));
}else {
    app.use(morgan('dev'));
}

mongodb().then(()=>{
    app.use('/', indexRoute);
    app.use((req, res, next)=>{
        next(new Error(message = "Route Not found"));
    });
    
    app.use((error, req, res, next)=>{
        return res.status(404).json({
            status: 'failed',
            message: error.message
        });
    });
    http.listen(port)
    http.on("listening", () => {
        console.log(`Server started on http://localhost:${port}`);
    });
    http.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
            console.log('Address in use, retrying...');
              setTimeout(() => {
                http.close();
                http.listen(port);
              }, 1000);
            }
          });
}).catch((error)=>{
    console.log(error.message);
});

