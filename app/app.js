const express = require('express');
require('dotenv').config();
const productsRouter = require('../routes/products');

const app = express();

app.use('/products', productsRouter);

const port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log('Listening on port ' + port);
});