var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var Cookies = require('cookies');
var dbQueries = require('./dbQueries.js');
var twilioAPI = require('./twilioAPI.js');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
   'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.listen('5000');

app.use(express.static('dist'));

app.use('/menu', (req, res) => {
  res.redirect('index-48d46f7176.html');
});

app.use('/api/getDish', (req, res) => {
  var fnOnComplete = function(err, response){
    if (err){
      res.send({err}); return;
    } else{
      res.send(response);
    }
  };
  dbQueries.getDish(req, fnOnComplete);
});

app.post('/api/postOrder', (req, res)=>{
  var fnOnComplete = function(err, response){
      if (err){
         res.send({err}); return;
        } else {
         res.send(response);
        }
    };
    dbQueries.postOrder(req, fnOnComplete);
});

app.use('/api/getUserOrders', (req, res)=>{
  var fnOnComplete = function(err, response){
      if (err){
         return res.send({err});
      } else {
         res.send(response);
      }
  }
  dbQueries.getOrders(req, fnOnComplete); 
});

app.use('/api/deleteOrder', (req,res)=>{
  var fnOnComplete = function(err, response){
      if (err){
         return res.send({err});
        } else {
           res.send('Deleted order: ' + req.query.id);
        }
  }
  dbQueries.deleteOrder(req,fnOnComplete);
});

app.use('/twilio', (req,res)=>{
  twilioAPI.sendMessage(1459);
  res.send('sent ;)');
});
