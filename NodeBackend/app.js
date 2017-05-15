const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dbQueries = require('./dbQueries.js');
const twilioAPI = require('./twilioAPI.js');
const authentication = require('./authentication.js');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(function (req, res, next)  {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
   'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.listen('5000');

app.use(express.static('dist'));

app.use('/menu', function (req, res)  {
  res.redirect('index-48d46f7176.html');
});

app.use('/api/getDish', function (req, res) {
  const fnOnComplete = function(err, response){
    if (err){
      res.send({ err: err });
    } else{
      res.send(response);
    }
  };
  dbQueries.getDish(req, fnOnComplete);
});

app.post('/api/postOrder', function (req, res){
  const fnOnComplete = function(err, response){
      if (err){
         res.send({ err: err });
        } else {
         res.send(response);
        }
    };
dbQueries.postOrder(req, fnOnComplete);
});

app.use('/api/getUserOrders', function (req, res) {
  var fnOnComplete = function(err, response){
      if (err){
         return res.send({err : err});
      } else {
         res.send(response);
      }
  }
  dbQueries.getOrders(req, fnOnComplete); 
});

app.use('/api/deleteOrder', function (req,res) {
  var fnOnComplete = function(err, response){
      if (err){
         return res.send({ err: err});
        } else {
           res.send('Deleted order: ' + req.query.id);
        }
  };
  dbQueries.deleteOrder(req,fnOnComplete);
});

app.post('/api/authentication', function (req, res) {
    var fnOnDBComplete = function(err, success){
        if (success){
            twilioAPI.sendMessage(code, phoneNumber, fnOnComplete);
        }
        else if (err) {
            return res.send({err: err});
        }
        else {
            return res.send({err: "Unknown placing auth!"});
        }
    };
    var fnOnSendComplete = function(err){
        if (err){
            return res.send({ err: err });
        } else {
            res.send('Code sent!');
        }
    };
     var recaptchaSuccess = function(err){
        if (err) {
            res.send({ err : "Recaptcha fail!" });
        }
        console.log("Recaptcha success!");
        var phoneNumber = req.body.phoneNumber;
        // phone lookup
//        if (!twilioAPI.phoneLookup(phoneNumber)){
//            res.send({ err : "Invalid phone number!" });
//        }
        var code = authentication.generateCode();
        var authObj = { phoneNumber : phoneNumber, code: code};
        //dbQueries.placeAuthentication(authObj, fnOnDBComplete);
        twilioAPI.sendMessage(code, phoneNumber, fnOnSendComplete);
    };
    var recaptcha = req.body.recaptcha;
    authentication.verifyRecaptcha(recaptcha, recaptchaSuccess);
});

app.post('/api/recaptcha', function (req, res) {
  authentication.verifyRecaptcha(req);
  res.send('fuck do i know');
});