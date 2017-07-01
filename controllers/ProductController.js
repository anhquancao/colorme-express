const pool = require('../config/database');
const helper = require('../util/helper');

module.exports = {
    comments: function (req, res) {
        const productId = req.params.product_id;
        const userId = req.query.user_id;

        const sql = "select comments.id as id, " +
            "(select count(id) from comment_likes where user_id = " + userId + " and comment_id = comments.id) as comment_likes," +
            "comments.content as content, " +
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
            if (error) throw error;
            // console.log(rows);
            res.json({
                comments: rows.map(function (r) {
                    return Object.assign({}, r.comments, {
                        liked: r[''].comment_likes === 1,
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
        });
    }
};