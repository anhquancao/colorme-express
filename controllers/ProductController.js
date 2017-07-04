const pool = require('../config/database');
const helper = require('../util/helper');
const transformer = require('../util/Transformer');
// const db = require('../config/ormDb');

module.exports = {
    content: function (req, res) {
        const productId = req.params.product_id;
        const user_id = req.query.user_id;

        pool.query("update products set views = views + 1 where id = " + productId,
            function (error, rows, fields) {
                if (error) {
                    return console.log(error);
                }
                let sql = "select *, (select count(id) from comments where comments.product_id = products.id) as comments_count " +
                    "from products " +
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
                    if (product.tags) {
                        if (product.tags.indexOf(',') !== -1) {
                            data['tags'] = product.tags.split(',');
                        } else {
                            data['tags'] = [product.tags];
                        }

                    }


                    if (result.categories.id) {
                        data['category'] = {
                            name: result.categories.category_name,
                            id: result.categories.id
                        }
                    }
                    if (result[''].comments_count) {
                        data['comments_count'] = result[''].comments_count;
                    }

                    pool.query('select count(id) as count from likes where likes.product_id=' + productId, function (error, result, fields) {
                        if (error) return console.log(error);
                        data['likes_count'] = result[0].count;
                        const sql = 'select * from products ' +
                            'join users on users.id = products.author_id where author_id=' + product.author_id +
                            " and products.id != " + product.id + " order by RAND() limit 4";
                        const options = {sql, nestTables: true};
                        pool.query(options, function (error, result, fields) {
                            if (error) return console.log(error);

                            data['more_products'] = result.map(function (r) {

                                const p = Object.assign({}, r.products, transformer.productType(r.products));
                                return Object.assign({}, p, {author: transformer.author(r.users)});
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
        let promises = [];
        const promise = new Promise(function (resolve, reject) {
            pool.query(options, function (error, rows, fields) {
                if (error) return console.log(error);
                // console.log(rows);


                rows.forEach(function (r) {
                    const commentLikesPromise = new Promise(function (resolve, reject) {
                        let sql = 'select users.name from comment_likes ' +
                            'join users on comment_likes.user_id = users.id ' +
                            'where comment_likes.comment_id = ' + r.comments.id;
                        pool.query(
                            sql,
                            function (error, result, fields) {
                                if (error) return console.log(error);
                                const comment = Object.assign({}, r.comments, {
                                    liked: r[''] && r[''].comment_likes === 1,
                                    commenter: Object.assign({}, r.users, {
                                        url: process.env.BASE_URL + "profile/" + r.users.username
                                    }),
                                    created_at: helper.timeSince(Date.parse(r.comments.created_at)),
                                    product: {
                                        author: {
                                            id: r.products.author_id
                                        }
                                    },
                                    likers: result
                                });
                                resolve(comment);
                            });
                    });
                    promises.push(commentLikesPromise);
                });

                resolve(true);
            });
        });

        promise.then(function () {
            Promise.all(promises).then(function (comments) {
                res.json({comments});
            });
        });

    },
    products: function (req, res) {
        const filter = req.query.filter;
        const user_id = req.query.user_id;
        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }

        let sql = "select *, (select count(id) from comments where comments.product_id = products.id) as comments_count " +
            "from products " +
            "join users on users.id = products.author_id " +
            "left join users as fusers on fusers.id = products.feature_id " +
            "left join categories on categories.id = products.category_id " +
            "left join topic_attendances on topic_attendances.product_id = products.id " +
            "left join topics on topics.id = topic_attendances.topic_id " +
            "left join groups on groups.id = topics.group_id ";

        if (filter === "new" || !filter) {
            sql += " order by products.created_at desc limit 20 offset " + (page - 1) * 20;
        } else {
            sql += " where DATE(products.created_at) >= DATE(NOW()) - INTERVAL " + filter + " DAY " +
                "order by rating desc " +
                "limit 20 offset " + (page - 1) * 20
        }

        let promiseArray = [];
        const options = {sql, nestTables: true};
        const promise1 = new Promise(function (resolve, reject) {
            pool.query(options, function (error, rows, fields) {
                if (error) console.log(error);

                rows.forEach(function (result) {
                    const promise = new Promise(function (resolve, reject) {
                        let product = result.products;


                        let data = Object.assign({}, product, {
                            author: transformer.author(result.users)
                        });

                        data['content'] = null;

                        if (result[''].comments_count) {
                            data['comments_count'] = result[''].comments_count;
                        } else {
                            data['comments_count'] = 0;
                        }

                        if (result.groups.id) {
                            data['group'] = {
                                id: result.groups.id,
                                name: result.groups.name,
                                link: '/group/' + result.groups.link
                            }
                        }

                        if (product.feature_id > 0) {
                            data['feature'] = {
                                id: result.fusers.id,
                                name: result.fusers.name,
                                username: result.fusers.username,
                            }
                        }

                        if (result.categories.id) {
                            data['category'] = {
                                name: result.categories.category_name,
                                id: result.categories.id
                            }
                        }

                        pool.query('select count(id) as count from likes where likes.product_id=' + product.id,
                            function (error, result, fields) {
                                if (error) return console.log(error);
                                data['likes_count'] = result[0].count;

                                pool.query('select name, username, avatar_url ' +
                                    'from users join likes on ' +
                                    'likes.liker_id = users.id where likes.product_id = ' + product.id,
                                    function (error, likers, fields) {
                                        if (error) return console.log(error);

                                        data["likers"] = likers;

                                        data = Object.assign(data, transformer.productType(product));


                                        if (user_id) {
                                            pool.query("select count(id) as count from likes where liker_id=" +
                                                user_id + " and product_id=" + product.id, function (error, rows, fields) {
                                                data['liked'] = rows[0].count > 0;
                                            });
                                        }

                                        if (product.type === 2) {
                                            pool.query('select value from colors where product_id=' + product.id, function (error, colors, fields) {
                                                data['colors'] = colors.map(function (color) {
                                                    return color.value;
                                                });
                                                resolve(data);
                                            });
                                        } else {
                                            resolve(data);
                                        }

                                    });


                            });

                    });
                    promiseArray.push(promise);
                });
                resolve(true);
            });
        });

        promise1.then(function () {
            Promise.all(promiseArray).then(function (products) {
                res.json({products});
            }, function (err) {
                console.log(err);
            });
        });


    },
};