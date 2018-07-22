import fs from 'fs';
import path from 'path';
import AWS from '../config/aws.config';

function uploadFileToS3(bucket, file, callback) {
  const s3 = new AWS.S3({ signatureVersion: 'v4' });

  const fileStream = fs.createReadStream(file);

  const uploadParams = {
    Bucket: bucket,
    Key: path.join('rec', path.basename(file)),
    Body: fileStream,
    ServerSideEncryption: 'AES256',
    StorageClass: 'STANDARD_IA',
  };

  s3.upload(uploadParams, (error, data) => {
    if (error) {
      callback({ status: 'fail', error });
    } else {
      callback(null, { location: data.Location });
    }
  });
}

export default uploadFileToS3;
