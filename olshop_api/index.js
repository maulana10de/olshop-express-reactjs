const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = 2020;
const app = express();
const bearerToken = require('express-bearer-token');
const db = require('./database');
const { usersRouter, productRouter, uploadRouter } = require('./routers');

// check database connection
db.connect((err) => {
  if (err) {
    console.log(`error connecting database : ${err.stack}`);
  }
  console.log(`${db.state} as id : ${db.threadId}`);
});

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());
app.use(cors());

app.use(bearerToken());

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.status(200).send({ success: 'success messages' });
});

app.use('/users', usersRouter);
app.use('/products', productRouter);
app.use('/files', uploadRouter);
app.listen(PORT, () => console.log(`server running on port ${PORT}`));
