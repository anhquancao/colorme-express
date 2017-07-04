const pool = require('../config/database');
const moment = require('moment');
const mysql = require('mysql');

module.exports = {
    toggleLike: function (req, res) {
        const commentId = req.params.comment_id;
        const userId = req.query.user_id;
        let sql = 'select count(id) as count from comments where id=' + commentId;
        pool.query(sql, function (error, result, fields) {
            if (error) console.log(error);
            const currentTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            if (result[0].count > 0) {
                const rawSql = 'select count(id) as count from comment_likes where comment_id = ? and user_id = ?';
                sql = mysql.format(rawSql, [commentId, userId]);

                pool.query(sql, function (error, result, fields) {
                    if (error) console.log(error);
                    if (result[0].count > 0) {
                        const rawSql = 'delete from comment_likes where comment_id = ? and user_id = ?';
                        const sql = mysql.format(rawSql, [commentId, userId]);
                        pool.query(sql, function (error, result, fields) {
                            if (error) console.log(error);
                            if (result.affectedRows > 0) {
                                pool.query('update comments set likes = likes - 1 where id = '+ commentId, function(error, result, fields){
                                    if (error) console.log(error);
                                    res.json({
                                        status: 1,
                                        message: "Đã bỏ thích"
                                    });
                                });

                            } else {
                                res.json({
                                    status: 0,
                                    message: "Không bỏ like được"
                                });
                            }
                        });
                    } else {
                        sql = 'insert into comment_likes (user_id, comment_id, created_at, updated_at) ' +
                            ' VALUES (' + userId + ',' + commentId + ',"' + currentTime + '","' + currentTime + '")';
                        pool.query(sql, function (error, result, fields) {
                            if (error) console.log(error);
                            pool.query('update comments set likes = likes + 1 where id = '+ commentId, function(error, result, fields){
                                if (error) console.log(error);
                                res.json({
                                    status: 1,
                                    status: "Đã thích"
                                });
                            });
                        });
                    }
                });
            } else {
                res.json({
                    status: 0,
                    message: "Comment không tồn tại"
                });
            }
        });
    }
};
