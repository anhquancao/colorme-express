const express = require('express');
require('dotenv').config();
const productsRouter = require('../routes/products');
const publicRouter = require('../routes/public');

const app = express();

app.use('/products', productsRouter);
app.use('/public', publicRouter);

const port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log('Listening on port ' + port);
});