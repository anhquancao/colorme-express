const AWS = require('aws-sdk');
AWS.config.loadFromPath('./env/awsCredential.json');

const s3 = new AWS.S3({
    params: {Bucket: process.env.S3_BUCKET}
});

module.exports = {
    S3: s3
};