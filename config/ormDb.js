const orm = require('orm');
const mysqlConn = 'mysql://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' +
    process.env.DB_HOST + '/' + process.env.DB_NAME + "?pool=true";
orm.connect(mysqlConn, function (error, db) {
    if (err) return console.error('Connection error: ' + err);
    module.exports = db;
});