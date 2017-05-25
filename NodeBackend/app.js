'use strict';

const express = require('express');
const app = express();
const helmet = require('helmet');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const dbQueries = require('./dbQueries.js');
const twilioAPI = require('./twilioAPI.js');
const authentication = require('./authentication.js');
const validation = require('./validation');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());

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
      res.status(err.responseCode).send({ err: err.errorMsg });
    } else{
      res.status(200).send(response);
    }
  };
  dbQueries.getDish(req, fnOnComplete);
});

app.post('/api/retrieveHistory', function (req, res) {
  const fnOnPasswordComplete = function(err, response){
      if (err){
          return res.status(401).send({ err : err.errMsg });
      } else {
          let parsedResponse = JSON.parse(response);
          let pass = parsedResponse.rows[0].value[0];
          if ( pass === req.body.password){
              dbQueries.retrieveHistory(phoneNumber, fnOnComplete);
          } else {
              return res.status(201).send({ err : 'Incorrect password!' });
          }
      }
  }
  const fnOnComplete = function(err, response){
      if (err){
         return res.status(400).send({err : err.errMsg });
      } else {
         let historyObj = validation.createHistoryObj(response);
          return res.status(200).send(historyObj);
      }
  };
  const phoneNumber = req.body.phoneNumber.toString().replace(/[^0-9]+/, '');
  if (validation.validatePhone(phoneNumber)) {
      dbQueries.retrieveUser(phoneNumber, fnOnPasswordComplete);
  }
  else{
      fnOnComplete({ errMsg : 'Invalid phone number'});
  }
});

app.post('/api/requestAuthentication', function (req, res) {
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
            return res.send('Code sent!');
        }
    };
    const recaptchaSuccess = function(err){
        if (err) {
            return res.status(400).send({ err : "Recaptcha fail!" });
        }
        const phoneNumber = req.body.phoneNumber.replace(/[^0-9]+/, '');
        const code = authentication.generateCode();
        const authObj = { phoneNumber : phoneNumber, code: code};
        dbQueries.placeAuthentication(authObj, fnOnDBComplete);
    };
    let recaptcha = req.body.recaptcha;
    authentication.verifyRecaptcha(recaptcha, recaptchaSuccess);
});

app.post('/api/sendOrder', function(req, res){
    const fnOnOrderComplete = function(err, response){
        if (err){
            res.status(400).send({err : 'Error'});
        } else {
            res.status(201).send(response);
        }
    };
    const fnOnCodeComplete = function(err, response){
        if (err){
            return res.status(400).send({err : err});
        } else {
            if (req.body.phoneCode === response.value.toString()){
                let orderDoc = { order: req.body.order, buyer: req.body.buyerName};
                dbQueries.sendOrder(orderDoc, fnOnOrderComplete);
            }
            else {
                return res.send ({ err: 'Invalid code!2' });
            }
        }
    };
    if (req.body.phoneCode && req.body.phoneCode.length === 4){
        let phoneNumber = req.body.phoneNumber.replace(/[^0-9]+/, '');
        if (!validation.validatePhone(phoneNumber)){
            return res.status(400).send({ err: 'Invalid phone number! '});
        }
        dbQueries.retrieveAuthentication(phoneNumber, fnOnCodeComplete);
    }
    else{
        res.status(400).send({ err: 'Invalid code!1' });
    }
});

app.post('/api/resetPassword', function(req, res){
    const fnOnRecaptchaComplete = function(err){
        if (err){
            return res.status(400).send({ err : err.errMsg });
        }
        return dbQueries.retrieveUser(req.body.phoneNumber, fnOnUserRetrieval);
    };
    const fnOnUserRetrieval = function(err, userObj){
        if (err){
            return res.status(400).send({ err : err.errMsg });
        }
        userObj = JSON.parse(userObj);
        newPassword = validation.generatePassword();
        let resetObj = { id: userObj.rows[0].id, _rev: userObj.rows[0].value[1], password: newPassword, phoneNumber : req.body.phoneNumber };
        return dbQueries.replaceUserDocument(resetObj, fnOnReplaceComplete);
    };
    const fnOnReplaceComplete = function(err){
        if (err){
            return res.status(400).send({ err : err.errMsg });
        }
        let message = 'Jūsų naujas slaptažodis yra: ' + newPassword;
        return twilioAPI.sendMessage(message, req.body.phoneNumber, fnOnMessageSent);
    };
    const fnOnMessageSent = function(err, response){
        if (err){
            return res.status(400).send({ err : err });
        }
        else{
            return res.status(200).send({ response: response });
        }
    };
    let recaptcha = req.body.recaptcha;
    let newPassword = '';
    authentication.verifyRecaptcha(recaptcha, fnOnRecaptchaComplete);
});

app.get('/testDB', function(req, res){
    const fnOnComplete = function(err, response){
        if (err){
            return res.send({err : err});
        } else {
            res.send(response);
        }
    };
    dbQueries.testAuthentication(fnOnComplete);
});

app.post('/api/testOrder', function(req, res){
    //let orderObj = validation.createOrderObj(req.body);
    const fnOnComplete = function(err, response){
        if (err){
            return res.send({err : err});
        } else {
            res.send(response);
        }
    };
    dbQueries.sendOrder(req.body, fnOnComplete);
});

app.get('/testAuth', function(req, res){
    const fnOnComplete = function(err, response){
        if (err){
            return res.send({err : err});
        } else {
            return res.status(200).send(response);
        }
    };
    dbQueries.retrieveAuth('860401484', fnOnComplete);
});

app.get('/testPass', function(req, res){
   let password = validation.generatePassword();
   res.send(password);
});