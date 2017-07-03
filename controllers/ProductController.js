const pool = require('../config/database');
const helper = require('../util/helper');
const transformer = require('../util/Transformer');
// const db = require('../config/ormDb');

module.exports = {
    content: function (req, res) {
        const productId = req.params.product_id;
        const user_id = req.query.user_id;
        let sql = "select * from products " +
            "join users on users.id = products.author_id " +
            "left join categories on categories.id = products.category_id " +
            "where products.id = " + productId;
        // console.log(sql);
        const options = {sql, nestTables: true};
        pool.query(options, function (error, rows, fields) {
            if (error) console.log(error);
            // console.log(rows);
            const result = rows[0];
            // console.log(result);

            let product = result.products;

            let data = Object.assign({}, product, {
                author: transformer.author(result.users)
            });

            if (result.categories) {
                data['category'] = {
                    name: result.categories.category_name,
                    id: result.categories.id
                }
            }

            pool.query('select count(id) as count from likes where likes.product_id=' + productId, function (error, result, fields) {
                if (error) return console.log(error);
                data['likes_count'] = result[0].count;
                pool.query('select * from products where author_id=' + product.author_id +
                    " and products.id != " + product.id + " order by RAND() limit 4", function (error, products, fields) {
                    data['more_products'] = products.map(function (p) {
                        return Object.assign({}, p, transformer.productType(p));
                    });
                    pool.query('select name, username, avatar_url ' +
                        'from users join likes on ' +
                        'likes.liker_id = users.id where likes.product_id = ' + productId,
                        function (error, likers, fields) {
                            if (error) return console.log(error);

                            data["likers"] = likers;

                            data = Object.assign(data, transformer.productType(product));


                            if (user_id) {
                                pool.query("select count(id) as count from likes where liker_id=" +
                                    user_id + " and product_id=" + productId, function (error, rows, fields) {
                                    data['liked'] = rows[0].count > 0;
                                });
                            }

                            if (product.type === 2) {
                                pool.query('select value from colors where product_id=' + productId, function (error, colors, fields) {
                                    data['colors'] = colors.map(function (color) {
                                        return color.value;
                                    });
                                    res.json(data);
                                });
                            } else {
                                res.json(data);
                            }

                        });


                });
            });


        });

    },
    comments: function (req, res) {
        const productId = req.params.product_id;
        const userId = req.query.user_id;

        let sql = "select comments.id as id, ";
        if (userId) {
            sql += "(select count(id) from comment_likes " +
                "where user_id = " + userId + " and comment_id = comments.id) as comment_likes,";
        }
        sql += "comments.content as content, " +
            "comments.likes as likes, " +
            "comments.created_at as created_at," +
            "users.avatar_url, " +
            "users.id, " +
            "users.name, " +
            "users.username, " +
            "products.author_id " +
            "from comments " +
            "join users on users.id = comments.commenter_id " +
            "join products on products.id = comments.product_id" +
            " where product_id = " + productId;

        const options = {sql, nestTables: true};
        pool.query(options, function (error, rows, fields) {
            if (error) return console.log(error);
            // console.log(rows);
            res.json({
                comments: rows.map(function (r) {
                    return Object.assign({}, r.comments, {
                        liked: r[''] && r[''].comment_likes === 1,
                        commenter: Object.assign({}, r.users, {
                            url: process.env.BASE_URL + "profile/" + r.users.username
                        }),
                        created_at: helper.timeSince(Date.parse(r.comments.created_at)),
                        product: {
                            author: {
                                id: r.products.author_id
                            }
                        }
                    })
                })
            });
        });

    },
    products: function (req, res) {
        const sql = 'select * from products order by created_at limit 10 offset 0';
        pool.query(sql, function (error, rows, fields) {
            if (error) return console.log(error);
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
        });
    }
};