const express = require('express');
const routes = require('./routes.form')
const fileUpload = require('express-fileupload')
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(fileUpload())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://react-website-bucket-kike.s3-website.eu-north-1.amazonaws.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(routes)
app.use(cors({
    origin: 'http://react-website-bucket-kike.s3-website.eu-north-1.amazonaws.com'
}));

app.listen(3000, () =>
  console.log('Example app listening on port 3000!'),
);

