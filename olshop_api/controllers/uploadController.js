const db = require('../database');
const { uploader } = require('../helper/uploader');

const fs = require('fs');

module.exports = {
  uploadFile: (req, res) => {
    try {
      let path = '/images';
      const upload = uploader(path, 'file').fields([{ name: 'file' }]);
      upload(req, res, (error) => {
        if (error) {
          console.log(error);
          res.status(500).send(error);
        }
        const { file } = req.files;
        // console.log('=====>', file, typeof file);
        const filepath = file ? path + '/' + file[0].filename : null;

        let data = { filepath };

        // console.log('====>', filepath, typeof filepath);

        let sqlInsert = `insert into upload_file set ?`;

        db.query(sqlInsert, data, (err, results) => {
          if (err) {
            console.log(err);
            res.status(err).send(err);
            fs.unlinkSync('./public' + filepath);
          }
          res.status(500).send('Upload Success');
        });
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
};
