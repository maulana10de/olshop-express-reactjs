const db = require('../database');
const transporter = require('../helper/email');
const Crypto = require('crypto');
const { createJWTToken } = require('../helper/createToken');
const { uploader } = require('../helper/uploader');
const { asyncQuery } = require('../helper/query');
const hbs = require('nodemailer-express-handlebars');

const KEY = `345A!a@`;

module.exports = {
  getUsers: async (req, res) => {
    try {
      let sqlGet = `SELECT * FROM tbusers`;
      let get = await asyncQuery(sqlGet);
      res.status(200).send(get);
    } catch (error) {
      console.log(error);
      res.status(500).send(err);
    }
  },

  keep: async (req, res) => {
    try {
      let sqlGet = `SELECT *
                        FROM tbusers
                        WHERE iduser = ${req.user.iduser}`;
      if (req.user.idUser != 'null') {
        let get = await asyncQuery(sqlGet);

        let { iduser, fullname, username, email, photo, role, status } = get[0];

        let token = createJWTToken({
          iduser,
          fullname,
          username,
          email,
          photo,
          role,
          status,
        });
        res.status(200).send({
          dataLogin: {
            iduser,
            fullname,
            username,
            email,
            photo,
            role,
            status,
            token,
          },
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  // keep: (req, res) => {
  //   let sqlGet = `SELECT *
  //                       FROM tbusers
  //                       WHERE iduser = ${req.user.iduser}`;

  //   if (req.user.iduser != 'null') {
  //     db.query(sqlGet, (err, results) => {
  //       if (err) res.status(500).send(err);

  //       let {
  //         iduser,
  //         fullname,
  //         username,
  //         email,
  //         photo,
  //         role,
  //         status,
  //       } = results[0];
  //       let token = createJWTToken({
  //         iduser,
  //         fullname,
  //         username,
  //         email,
  //         photo,
  //         role,
  //         status,
  //       });
  //       res.status(200).send({
  //         dataLogin: {
  //           iduser,
  //           fullname,
  //           username,
  //           email,
  //           photo,
  //           role,
  //           status,
  //           token,
  //         },
  //       });
  //     });
  //   }
  // },

  getUserById: async (req, res) => {
    try {
      let sqlGet = `SELECT * FROM tbusers WHERE iduser = ${req.params.iduser}`;
      let get = await asyncQuery(sqlGet);
      res.status(200).send(get);
    } catch (error) {
      res.status(500).send(err);
    }
  },

  // Function without Async
  // getUserById: (req, res) => {
  //   let sqlGet = `SELECT * FROM tbusers WHERE iduser = ${req.params.iduser}`;

  //   db.query(sqlGet, (err, results) => {
  //     if (err) {
  //       console.log(err);
  //       res.status(500).send(err);
  //     }
  //     res.status(200).send(results);
  //   });
  // },

  deleteUser: (req, res) => {
    let sqlGet = `DELETE FROM tbusers WHERE iduser = ${req.params.iduser}`;

    db.query(sqlGet, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      }
      res.status(200).send(`deleted successfully`);
    });
  },

  registerUser: (req, res) => {
    let sqlInsert = `INSERT INTO tbusers SET ?`;

    let hashPassword = Crypto.createHmac('sha256', KEY)
      .update(req.body.password)
      .digest('hex');

    req.body.password = hashPassword;

    let char = `0123456789abcdefghijklmnopqrstuvwxyz`;
    let OTP = ``;
    for (let i = 0; i < 6; i++) {
      OTP += char.charAt(Math.floor(Math.random() * char.length));
    }

    req.body.status = OTP;

    db.query(sqlInsert, req.body, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      }

      // console.log('RESULTS :', results);

      // get user data
      let sqlGet = `SELECT * FROM tbusers WHERE iduser = ${results.insertId}`;

      db.query(sqlGet, (errGet, resultsGet) => {
        if (errGet) {
          console.log(errGet);
          res.status(500).send(errGet);
        }

        if (resultsGet) {
          let {
            iduser,
            fullname,
            username,
            email,
            role,
            status,
          } = resultsGet[0];

          // console.log(resultsGet[0]);

          let token = createJWTToken({
            iduser,
            fullname,
            username,
            email,
            role,
            status,
          });
          // console.log('Check Token ===>', token);

          // handlebar configuration
          const handlebarsOption = {
            viewEngine: {
              extName: '.html',
              partialsDir: './emailTemplate',
              layoutsDir: './emailTemplate',
              defaultLayout: 'verify.html',
            },
            viewPath: './emailTemplate',
            extName: '.html',
          };

          transporter.use('compile', hbs(handlebarsOption));

          let mail = {
            from: 'Admin <maulana4de@gmail.com>',
            to: 'maulana10de@gmail.com',
            subject: `Penting: Kode Rahasia `,
            template: 'verify', // verify = nama file html
            context: {
              nama: fullname,
              link: `http://localhost:3000/verification/${token}`,
              image: 'http://localhost:2020/images/file1605409910378.jpeg',
            },
            // html: `
            //         <h3>Segera Verifikasi Akun Kamu</h3>
            //         <hr/>
            //         <P>Your OTP : <strong>${OTP}</strong></p>
            //         <p><a href='http://localhost:3000/verification/${token}'>Verifiy Now !</a></p>
            //         `,
          };

          transporter.sendMail(mail, (errMail, resMail) => {
            if (errMail) {
              console.log(errMail);
              return res.status(500).send(errMail);
            }
            res.status(200).send(results);
          });
        }
      });
    });
  },

  verification: async (req, res) => {
    try {
      let sqlUpdate = `UPDATE tbusers
                        SET status = 'Verified'
                        WHERE iduser=${req.user.iduser} 
                        AND status=${db.escape(req.body.otp)}`;
      let verified = await asyncQuery(sqlUpdate);
      res.status(200).send(true);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  // verification: (req, res) => {
  //   // console.log('Check Req ===>', req.body.otp, req.params.iduser);

  //   let sqlUpdate = `UPDATE tbusers
  //                    SET status = 'Verified'
  //                    WHERE iduser=${req.user.iduser}
  //                    AND status=${db.escape(req.body.otp)}`;

  //   db.query(sqlUpdate, (err, results) => {
  //     if (err) {
  //       console.log(err);
  //       res.status(500).send(err);
  //     }
  //     console.log(results);
  //     res.status(200).send(results);
  //   });
  // },

  loginUser: async (req, res) => {
    try {
      // console.log(req.query);
      let hashPassword = Crypto.createHmac('sha256', KEY)
        .update(req.body.password)
        .digest('hex');

      // console.log(hashPassword);
      let sqlGet = `SELECT *
                        FROM tbusers
                        WHERE username = ${db.escape(req.body.username)}
                        AND password = ${db.escape(hashPassword)}`;

      let get = await asyncQuery(sqlGet);
      // console.log(get);
      if (get[0]) {
        let { iduser, fullname, username, email, role, status } = get[0];
        let token = createJWTToken({
          iduser,
          fullname,
          username,
          email,
          role,
          status,
        });

        if (status != 'Verified') {
          res.status(200).send({ message: 'You not verified account' });
        } else {
          res
            .status(200)
            .send({ dataLogin: get[0], token, message: 'Login Success' });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  // loginUser: (req, res) => {
  //   // console.log(req.query);
  //   let hashPassword = Crypto.createHmac('sha256', KEY)
  //     .update(req.body.password)
  //     .digest('hex');
  //   // console.log(hashPassword);
  //   let sqlGet = `SELECT *
  //                       FROM tbusers
  //                       WHERE username = ${db.escape(req.body.username)}
  //                       AND password = ${db.escape(hashPassword)}`;

  //   db.query(sqlGet, (err, results) => {
  //     if (err) {
  //       console.log(err);
  //       res.status(500).send(err);
  //     }
  //     // console.log(results);
  //     let { iduser, fullname, username, email, role, status } = results[0];
  //     // console.log(results[0]);

  //     let token = createJWTToken({
  //       iduser,
  //       fullname,
  //       username,
  //       email,
  //       role,
  //       status,
  //     });

  //     if (status != 'Verified') {
  //       res.status(200).send({ message: 'You not verified account' });
  //     } else {
  //       res
  //         .status(200)
  //         .send({ dataLogin: results[0], token, message: 'Login Success' });
  //     }
  //   });
  // },

  sendEmailResetPassword: async (req, res) => {
    try {
      let sqlGet = `SELECT * FROM tbusers WHERE email =${db.escape(
        req.body.email
      )}`;

      let get = await asyncQuery(sqlGet);
      if (get[0]) {
        let { iduser } = get[0];

        let mail = {
          from: 'Admin <maulana4de@gmail.com>',
          to: 'maulana10de@gmail.com',
          subject: `Reset Password`,
          html: `
                  <h3>Reset Password</h3>
                  <hr/>
                  <P>Silahkan Klik Link dibawah ini</p>
                  <p><a href='http://localhost:3000/resetPassword/${iduser}'>Reset Password</a></p>
                  `,
        };
        transporter.sendMail(mail, (errMail, resMail) => {
          if (errMail) {
            console.log(errMail);
            return res.status(500).send(errMail);
          }
          res.status(200).send(results);
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  // sendEmailResetPassword: (req, res) => {
  //   console.log(req.body);
  //   let sqlGet = `SELECT * FROM tbusers WHERE email =${db.escape(
  //     req.body.email
  //   )}`;

  //   db.query(sqlGet, (err, results) => {
  //     if (err) {
  //       console.log(err);
  //       res.status(500).send(err);
  //     }

  //     // console.log(results);
  //     let { iduser } = results[0];

  //     let mail = {
  //       from: 'Admin <maulana4de@gmail.com>',
  //       to: 'maulana10de@gmail.com',
  //       subject: `Reset Password`,
  //       html: `
  //               <h3>Reset Password</h3>
  //               <hr/>
  //               <P>Silahkan Klik Link dibawah ini</p>
  //               <p><a href='http://localhost:3000/resetPassword/${iduser}'>Reset Password</a></p>
  //               `,
  //     };
  //     transporter.sendMail(mail, (errMail, resMail) => {
  //       if (errMail) {
  //         console.log(errMail);
  //         return res.status(500).send(errMail);
  //       }
  //       res.status(200).send(results);
  //     });
  //   });
  // },

  resetPassword: async (req, res) => {
    try {
      console.log('Check Req ===>', req.body);

      let hashPassword = Crypto.createHmac('sha256', KEY)
        .update(req.body.password)
        .digest('hex');

      req.body.password = hashPassword;

      let sqlUpdate = `UPDATE tbusers
                       SET password = ${db.escape(hashPassword)}
                       WHERE iduser=${db.escape(req.body.idUser)}
                       `;
      let reset = await asyncQuery(sqlUpdate);
      if (reset) {
        res.status(200).send(true);
        alert('Password berhasil diubah');
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(err);
    }
  },

  // resetPassword: (req, res) => {
  //   console.log('Check Req ===>', req.body);

  //   let hashPassword = Crypto.createHmac('sha256', KEY)
  //     .update(req.body.password)
  //     .digest('hex');

  //   req.body.password = hashPassword;

  //   let sqlUpdate = `UPDATE tbusers
  //                    SET password = ${db.escape(hashPassword)}
  //                    WHERE iduser=${db.escape(req.body.idUser)}
  //                    `;

  //   db.query(sqlUpdate, (err, results) => {
  //     if (err) {
  //       console.log(err);
  //       res.status(500).send(err);
  //     }
  //     console.log(results);
  //     res.status(200).send(results);
  //   });
  // },

  uploadPhoto: (req, res) => {
    try {
      let path = '/images';
      const upload = uploader(path, 'file').fields([{ name: 'file' }]);
      upload(req, res, (err) => {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        }
        const { file } = req.files;
        console.log('===> ', file);
        const photo = file ? path + '/' + file[0].filename : null;

        let data = { photo };

        let sqlUpdate = `UPDATE tbusers
                     SET ?
                     WHERE iduser=${req.user.iduser}`;
        db.query(sqlUpdate, data, (err, results) => {
          if (err) {
            console.log(err);
            res.status(500).send(err);
          }
          res.status(200).send('Update Photo Successfully');
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
};
