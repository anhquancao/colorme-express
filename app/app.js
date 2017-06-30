const express = require('express');
require('dotenv').config();

const pool = require('../config/database');


const app = express();

app.get('/', function (req, res) {
    const sql = 'select * from products order by created_at limit 10 offset 0';
    pool.query(sql, function (error, rows, fields) {
        if (error) throw error;
        res.json({
            products: rows.map(function (r) {
                return {
                    id: r.id,
                    created_at: r.created_at,
                    image_url: r.image_url,
                    views_count: r.views,
                    thumb_name: r.thumb_name,
                    thumb_url: r.thumb_url
                }
            })
        });
        // console.log(results);
        // console.log(fields);
    });
    // res.send('Hello world');
});

const port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log('Listening on port ' + port);
});