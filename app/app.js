const express = require('express');
require('dotenv').config();
const productsRouter = require('../routes/products');
const publicRouter = require('../routes/public');


const origins = [
    "http://localhost:3000",
    "http://colorme.vn",
    "http://www.colorme.vn",
    "http://manage.colorme.vn",
    "http://beta.colorme.vn",
    "http://colorme.dev"
];
const app = express();

// Add headers
app.use(function (req, res, next) {
    if (origins.indexOf(req.headers.origin) > -1) {
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
    }
    // Pass to next layer of middleware
    next();
});

app.use('/products', productsRouter);
app.use('/public', publicRouter);

const port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log('Listening on port ' + port);
});