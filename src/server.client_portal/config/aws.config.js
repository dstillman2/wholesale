import path from 'path';
import AWS from 'aws-sdk';

AWS.config.loadFromPath(path.join(__dirname, 's3_config.json'));

const s3 = new AWS.S3({ signatureVersion: 'v4' });

export default s3;
