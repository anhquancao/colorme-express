// const pool = require('../config/database');
const S3 = require('../config/aws').S3;
const fs = require('fs');
const sharp = require('sharp');
module.exports = {
    upload: (req, res) => {
        const file = req.file;
        let width = 500;
        let height = 500;

        if (req.query.width) {
            width = Number(req.query.width);
        }

        if (req.query.height) {
            height = Number(req.query.height);
        }

        const fileName = file.filename;

        const date = new Date();
        const photoKey = "tmp/" + fileName + date.getMilliseconds() + ".jpg";
        // file.originalname.split(".").pop();
        // fs.createReadStream(file.path)
        sharp(file.path)
            .resize(width, height)
            .max()
            .toBuffer()
            .then(function (outputBuffer) {
                S3.upload({
                    Key: photoKey,
                    Body: outputBuffer,
                    ContentType: "image/jpeg",
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
            })
            .catch((error) => {
                console.log(error);
                res.json(error);
            });

    }
};
