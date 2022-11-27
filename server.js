const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');
require('dotenv').config();
const swaggerJsDoc = require('swagger-jsdoc');

const indexRoute = require('./routes/indexRoute');
const options = require('./utils/swaggerOptions')

const app = express();
const spec = swaggerJsDoc(options);
const port = process.env.PORT;

//middlewares
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(spec));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/',express.static('public'));
app.use(morgan('dev'));


app.get('/', indexRoute);
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});