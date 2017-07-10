const AWS = require('aws-sdk');
const myCredentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: 'IDENTITY_POOL_ID'});
const myConfig = new AWS.Config({
    credentials: myCredentials,
    region: 'ap-southeast-1'
});