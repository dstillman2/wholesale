import fs from 'fs';
import path from 'path';
import async from 'async';
import uuidv4 from 'uuid/v4';
import formidable from 'formidable';
import s3 from '../config/aws.config';
import { BUCKET } from '../options';

const imageUploadHandler = {
  post(req, res) {
    const form = formidable.IncomingForm();
    const uploads = [];

    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname, '../static', 'files');

    form.on('file', (field, file) => {
      const fileName = uuidv4();
      const ext = file.name.split('.').slice(-1);

      fs.renameSync(file.path, `${form.uploadDir}/${fileName}.${ext}`);

      uploads.push(`${fileName}.${ext}`);
    });

    form.parse(req, (error) => {
      if (error) {
        res.status(500).end();

        return;
      }

      async.eachSeries(uploads, (item, callback) => {
        const params = {
          Bucket: BUCKET,
          Key: item,
          Body: fs.createReadStream(path.join(__dirname, '../static', 'files', item)),
        };

        s3.putObject(params, (eachSeriesError) => {
          if (eachSeriesError) {
            callback('s3 error');
          } else {
            fs.unlinkSync(path.join(__dirname, '../static', 'files', item));

            callback(null);
          }
        });
      }, (eachSeriesError) => {
        if (eachSeriesError) {
          res.status(500).json({ error: 's3 error' });
        } else {
          res.json({ uploads });
        }
      });
    });
  },
};

export default imageUploadHandler;
