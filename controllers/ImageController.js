// const pool = require('../config/database');
const S3 = require('../config/aws').S3;
const fs = require('fs');
module.exports = {
    upload: (req, res) => {
        const file = req.file;
        const fileName = file.filename;

        var date = new Date();
        const photoKey = "tmp/" + fileName + date.getMilliseconds() + "." + file.originalname.split(".").pop();
        S3.upload({
            Key: photoKey,
            Body: fs.createReadStream(file.path),
            ContentType: file.mimetype,
            ACL: 'public-read'
        }, function (err, data) {
            fs.unlink(file.path);
            if (err) {
                return console.log(err);
            }
            res.json({
                status: 1,
                data: Object.assign({}, data, {url: process.env.S3_URL + "/" + photoKey})
            });
        });
    }
};
