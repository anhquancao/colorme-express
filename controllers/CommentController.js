const pool = require('../config/database');
const moment = require('moment');
const mysql = require('mysql');

module.exports = {
    toggleLike: function (req, res) {
        const commentId = req.params.comment_id;
        const userId = req.query.user_id;
        let sql = 'select count(id) as count from comments where id=' + commentId;
        pool.query(sql, function (error, result, fields) {
            if (error) throw error;
            const currentTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            if (result[0].count > 0) {
                const rawSql = 'select count(id) as count from comment_likes where comment_id = ? and user_id = ?';
                sql = mysql.format(rawSql, [commentId, userId]);

                pool.query(sql, function (error, result, fields) {
                    if (error) throw error;
                    if (result[0].count > 0) {
                        const rawSql = 'delete from comment_likes where comment_id = ? and user_id = ?';
                        const sql = mysql.format(rawSql, [commentId, userId]);
                        pool.query(sql, function (error, result, fields) {
                            if (error) throw error;
                            if (result.affectedRows > 0) {
                                res.json({
                                    status: 1,
                                    message: "Bỏ like thành công"
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
                            if (error) throw error;
                            res.json({
                                status: 1,
                                insert_id: result.insertId
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
