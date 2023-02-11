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

const indexRoute = require('./routes/indexRoute');
const options = require('./utils/swaggerOptions');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
io.on("chat",()=>{
    console.log("connected");
})
const spec = swaggerJsDoc(options);
const port = process.env.PORT || 5001;

//middlewares
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(spec));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/',express.static('public'));
app.use(morgan('dev'));
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })
// create logger
app.use(morgan("combined",{ stream: accessLogStream }));

mongodb().then(()=>{
        app.use('/', indexRoute);
        app.use((req, res, next)=>{
            next(new Error(message = "Not found"));
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

