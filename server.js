const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const port = process.env.PORT;

//middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/',express.static('public'));


app.get('/', (req, res) => {
    res.send("<h1>Hello world</h1>");
});
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});