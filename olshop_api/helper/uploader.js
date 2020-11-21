const multer = require('multer');
const fs = require('fs');

module.exports = {
  // params pertama mengarahkan ke direktori tujuannya
  // params kedua untuk mengatur penamaan terhadap filenya
  uploader: (directory, fileNamePrefix) => {
    let defaultDir = './public';

    // untuk menyimpan file kedalam disk storage backend
    const storage = multer.diskStorage({
      // pengaturan direktori
      destination: (req, file, cb) => {
        const pathDir = defaultDir + directory; // './public + /images'
        // jika direktori 'image' ada maka callback mereturn pathDir
        if (fs.existsSync(pathDir)) {
          console.log('Directory Ada');
          cb(null, pathDir);
        } else {
          // jika tidak ada maka dibuatkan direktori baru
          fs.mkdir(pathDir, { recursive: true }, (err) => cb(err, pathDir));
          console.log('Directory Tidak Ada, Baru dibuat');
        }
      },

      filename: (req, file, cb) => {
        let ext = file.originalname.split('.');
        let filename = fileNamePrefix + Date.now() + '.' + ext[ext.length - 1];
        cb(null, filename);
      },
    });

    const fileFilter = (req, file, cb) => {
      const ext = /\.(jpg|jpeg|png|gif|pdf|doc|docx|txt|xls)/;
      if (!file.originalname.match(ext)) {
        return cb(new Error('Your file type are denied'), false);
      }
      cb(null, true);
    };

    return multer({
      storage,
      fileFilter,
    });
  },
};
