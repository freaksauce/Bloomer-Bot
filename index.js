var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

//server frontpage
app.get('/', function(req, res) {
  res.send('This is Guitar Noize Bot Server');
});

// Facebook webhook
app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === 'V5f!fitvzm&N') {
    res.send(req.query['hub.challenge']);
  }else{
    res.send('Invalid verify token');
  }
});
