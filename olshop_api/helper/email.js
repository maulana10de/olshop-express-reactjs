const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'maulana4de@gmail.com',
    pass: 'ekxvrzgvsfqrywpl',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;
