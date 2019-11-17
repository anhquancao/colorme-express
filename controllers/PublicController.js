const pool = require('../config/database');
const helper = require('../util/helper.js');

module.exports = {
    homeInfo: function (req, res) {
        const basesSql = 'select address, center, id, name ' +
            'from bases order by created_at';
        pool.query(basesSql, function (error, bases, fields) {
            if (error) throw error;
            const coursesSql = 'select image_url as avatar_url, description, duration, icon_url, id, name, price ' +
                'from courses where status = 1  and icon_name != \'\' order by created_at';

            pool.query(coursesSql, (error, courses, fields) => {
                if (error) throw error;
                res.json({
                    bases,
                    courses: courses.map(function (c) {
                        return Object.assign({}, c, {linkId: helper.convertViToEng(c.name).replace(/ /g, "-")});
                    })
                });
            });

            // console.log(results);
            // console.log(fields);
        });
        // res.send('Hello world');
    }
};