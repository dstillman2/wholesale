import s3 from '../config/aws.config';
import { BUCKET } from '../options';

const imageHandler = {
  get(req, res) {
    const fileName = req.params.fileName;

    const params = {
      Bucket: BUCKET,
      Key: fileName,
    };

    s3.getObject(params, (error, data) => {
      if (error) {
        res.status(500).send({ error });
      } else {
        res.setHeader('Cache-Control', 'public,max-age=680000');
        res.send(data.Body);
      }
    });
  },
};

export default imageHandler;
