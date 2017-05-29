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
          return res.status(401).send({ err : err.errorMsg });
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
         return res.status(400).send({err : err.errorMsg });
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
      fnOnComplete({ errorMsg : 'Invalid phone number'});
  }
});

app.post('/api/requestAuthentication', function (req, res) {
    const fnOnDBComplete = function(err, success, authObj){
        if (success){
            //twilioAPI.sendMessage(authObj.code, authObj.phoneNumber, fnOnSendComplete);
            res.send('success');
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
        const code = 1111;//authentication.generateCode();
        const authObj = { phoneNumber : phoneNumber, code: code};
        dbQueries.placeAuthentication(authObj, fnOnDBComplete);
    };
    let recaptcha = req.body.recaptcha;
    //authentication.verifyRecaptcha(recaptcha, recaptchaSuccess);
    recaptchaSuccess();
});

app.post('/api/sendOrder', function(req, res){
    let phoneNumber;
    const fnOnCodeComplete = function(err, response){
        if (err){
            return res.status(400).send({err : err});
        } else {
            if (req.body.phoneCode === response.value[0].toString()){
                let authConfirmObj = {
                    id : response.id,
                    _rev: response.value[1],
                    code: response.value[0],
                    phoneNumber: response.key[0],
                    date: response.key[1],
                    status: 'confirmed'
                };
                dbQueries.setAuthConfirmed(authConfirmObj, fnOnCodeConfirmedComplete);
            }
            else {
                return res.send ({ err: 'Invalid code!2' });
            }
        }
    };
    const fnOnCodeConfirmedComplete = function(err){
        if (err){
            return res.status(400).send({ err : err.errorMsg });
        } else {
            let orderDoc = validation.createOrderObj(req.body);
            dbQueries.sendOrder(orderDoc, fnOnOrderComplete);
        }
    };
    const fnOnOrderComplete = function(err){
        if (err){
            res.status(400).send({err : 'Error'});
        } else {
   //         dbQueries.retrieveHistory(phoneNumber, fnOnHistoryRetrieveComplete);
            dbQueries.retrieveUser(phoneNumber, fnOnUserRetrieveComplete);
        }
    };
    const fnOnHistoryRetrieveComplete = function(err, response){
        if (err){
            res.status(400).send({ err : err.errorMsg });
        } else {
            let jsonedBody = JSON.parse(response);
            if (jsonedBody.rows.length > 0){
                let userObj = {
                    phone: phoneNumber,
                    password: jsonedBody.rows[0].value[0]
                };
                res.status(200).send(userObj);
            }
            else{
                res.status(400).send({ err : "Pabandykite dar kartą."});
            }
        }
    }
    if (req.body.phoneCode && req.body.phoneCode.length === 4){
        phoneNumber = req.body.phoneNumber.replace(/[^0-9]+/, '');
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
            return res.status(400).send({ err : err.errorMsg });
        }
        return dbQueries.retrieveUser(req.body.phoneNumber, fnOnUserRetrieval);
    };
    const fnOnUserRetrieval = function(err, userObj){
        if (err){
            return res.status(400).send({ err : err.errorMsg });
        }
        userObj = JSON.parse(userObj);
        newPassword = validation.generatePassword();
        let resetObj = { id: userObj.rows[0].id, _rev: userObj.rows[0].value[1], password: newPassword, phoneNumber : req.body.phoneNumber };
        return dbQueries.replaceUserDocument(resetObj, fnOnReplaceComplete);
    };
    const fnOnReplaceComplete = function(err){
        if (err){
            return res.status(400).send({ err : err.errorMsg });
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

