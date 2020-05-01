const AWS = require('aws-sdk');
const express = require('express');
const bodyParser = require('body-parser');

AWS.config.region = process.env.REGION;

const ddb = new AWS.DynamoDB();

const ddbTable = process.env.STARTUP_SIGNUP_TABLE;

const app = express();

app.use(express.static('static'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.render('index', {
    theme: process.env.THEME || 'flatly',
  });
});

app.post('/signup', function (req, res) {
  const item = {
    email: { S: req.body.email },
    name: { S: req.body.name },
    preview: { S: req.body.previewAccess },
    theme: { S: req.body.theme },
  };

  ddb.putItem(
    {
      TableName: ddbTable,
      Item: item,
      Expected: { email: { Exists: false } },
    },
    function (err) {
      if (!err) {
        res.status(201).end();
      }else{
        const returnStatus = 500;

        if (err.code === 'ConditionalCheckFailedException') {
          returnStatus = 409;
        }

        res.status(returnStatus).end();
        console.log('DDB Error: ' + err);
      }
    }
  );
});

const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Server running at http://127.0.0.1:' + port + '/');
});
