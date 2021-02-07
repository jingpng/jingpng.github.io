const express = require('express'); // DO NOT DELETE
const cors = require('cors');
const morgan = require('morgan');
const app = express(); // DO NOT DELETE
app.use(express.static("./"))

const database = require('./database');
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();
app.use(urlencodedParser);
app.use(jsonParser);

app.use(morgan('dev'));
app.use(cors());


module.exports = { app };