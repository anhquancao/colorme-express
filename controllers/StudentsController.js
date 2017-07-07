const pool = require('../config/database');
const consts = require('../util/const');

module.exports = {
    paidStudent: (req, res) => {
        const genId = req.params.gen_id;
        const filter = req.params.filter;
        let sql = 'select registers.code,' +
            'registers.money,' +
            'registers.id as register_id, ' +
            'registers.received_id_card, ' +
            'users.id as user_id, ' +
            'users.name as name,' +
            'users.phone as phone,' +
            'users.avatar_url as avatar_url, ' +
            'users.email as email ' +
            'from registers join users on users.id = registers.user_id ' +
            'where registers.gen_id =' + genId;
        switch (filter) {
            case 'paid':
                sql += ' and registers.money > 0';
                break;
            case 'zero':
                sql += ' and registers.money = 0 and registers.status = 1';
                break;
        }
        if (!genId) {
            res.json({
                status: 0,
                message: "gen_id không tồn tại"
            });
        }


        pool.query(sql, function (error, results, fields) {
            if (error) return console.log(error);
            res.json({
                status: 1,
                students: results.map(s => {
                    s.avatar_url = s.avatar_url ? s.avatar_url : consts.defaultAvatarUrl;
                    return s;
                })
            });
        });
    }
};