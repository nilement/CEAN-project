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
    const fnOnDBComplete = function(err, success, authObj){
        if (success){
            twilioAPI.sendMessage(authObj.code, authObj.phoneNumber, fnOnSendComplete);
        }
        else if (err) {
            return res.send({err: err});
        }
        else {
            return res.send({err: "Unknown placing auth error!"});
        }
    };
    const fnOnSendComplete = function(err){
        if (err){
            return res.send({ err: err });
        } else {
            res.send('Code sent!');
        }
    };
     const recaptchaSuccess = function(err){
        if (err) {
            res.send({ err : "Recaptcha fail!" });
        }
        const phoneNumber = req.body.phoneNumber;
        // phone lookup
//        if (!twilioAPI.phoneLookup(phoneNumber)){
//            res.send({ err : "Invalid phone number!" });
//        }
        const code = authentication.generateCode();
        const authObj = { phoneNumber : phoneNumber, code: code};
        dbQueries.placeAuthentication(authObj, fnOnDBComplete);
//      twilioAPI.sendMessage(code, phoneNumber, fnOnSendComplete);
    };
    let recaptcha = req.body.recaptcha;
    authentication.verifyRecaptcha(recaptcha, recaptchaSuccess);
});

app.post('/api/phoneCode', function(req, res){
    let fnOnComplete = function(err, response){
        if (err){
            return res.send({err : err});
        } else {
            if (req.body.code === response.value.toString()){
                res.send('Success!')
            }
            else {
                res.send ({ err: 'Invalid code!2' });
            }
        }
    };
    if (req.body.code && req.body.code.length === 4){
        dbQueries.retrieveAuth('860401484', fnOnComplete);
    }
    else{
        res.send({ err: 'Invalid code!1' });
    }
});

app.get('/testDB', function(req, res){
    let fnOnComplete = function(err, response){
        if (err){
            return res.send({err : err});
        } else {
            res.send(response);
        }
    };
    dbQueries.testAuthentication(fnOnComplete);
});

app.get('/testAuth', function(req, res){
    let fnOnComplete = function(err, response){
        if (err){
            return res.send({err : err});
        } else {
            return res.send(response);
        }
    };
    dbQueries.retrieveAuth('860401484', fnOnComplete);
});