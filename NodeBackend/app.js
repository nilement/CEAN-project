'use strict';
require('dotenv').config();

const express = require('express');
const app = express();
const helmet = require('helmet');
const expressValidator = require('express-validator');

const http = require('http');
const https = require('https');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const dbQueries = require('./dbQueries.js');
const twilioAPI = require('./twilioAPI.js');
const authentication = require('./authentication.js');
const dataHandler = require('./dataHandler.js');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());
app.use(expressValidator());

app.use(function (req, res, next)  {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
   'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(function (error, req, res, next){
    if (error instanceof SyntaxError){
        return res.status(400).send({ err: "Invalid data! "});
    } else {
        next();
    }
});

http.createServer(app).listen(process.env.NODE_PORT);

app.use(express.static('dist'));

app.use('/menu', function (req, res)  {
  res.redirect(process.env.STATIC_FILE);
});

app.get('/api/getDish', function (req, res) {
  const fnOnComplete = function(err, response){
    if (err){
      res.status(err.responseCode).send({ err: err.errorMsg });
    } else{
      res.status(200).send(response);
    }
  };
  let dishID = dataHandler.handleDishQuery(req);
  if (dishID){
      dbQueries.getDish(dishID, fnOnComplete);
  } else {
      res.status(400).send({ err: "Invalid dish ID!"});
  }
});


app.get('/api/menu', function(req, res){
    const fnOnComplete = function(err, response){
        if (err){
            res.status(err.responseCode).send({ err: err.errorMsg });
        } else {
            let menuObj = dataHandler.createMenuObj(response);
            return res.status(200).send(menuObj);
        }
    };
    dbQueries.retrieveMenu(null, fnOnComplete);
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
  };
  const fnOnComplete = function(err, response){
      if (err){
         return res.status(400).send({err : err.errorMsg });
      } else {
         let historyObj = dataHandler.createHistoryObj(response);
         return res.status(200).send(historyObj);
      }
  };
  const phoneNumber = dataHandler.handlePhoneNumber(req);
  if (phoneNumber) {
      dbQueries.retrieveUser(phoneNumber, fnOnPasswordComplete);
  } else {
      fnOnComplete({ errorMsg : 'Invalid phone number'});
  }
});

app.post('/api/requestAuthentication', function (req, res) {
    const recaptchaSuccess = function(err){
        if (err) {
            return res.status(400).send({ err : "Recaptcha fail!" });
        }
        dataHandler.handleAuthRequest(req, fnOnValidateSuccess);
    };
    const fnOnValidateSuccess = function(err, authObj){
        if (err){
            return res.status(400).send({ err : err.errorMsg });
        }
        dbQueries.placeAuthentication(authObj, fnOnDBComplete);
    };
    const fnOnDBComplete = function(err, success, authObj){
        if (success){
            if (process.env.NODE_ENV === 'development') {
                return fnOnSendComplete();
            }
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
            return res.status(200).send({ err: err });
        } else {
            return res.status(200).send('Code sent!');
        }
    };
    let recaptcha = req.body.recaptcha;
    if (process.env.NODE_ENV === 'development'){
        return recaptchaSuccess();
    }
    authentication.verifyRecaptcha(recaptcha, recaptchaSuccess);
});

//TODO: create user if none found
app.post('/api/sendOrder', function(req, res){
    const fnOnPhoneValidateComplete = function(err){
        if (err){
            return res.status(400).send({ err: err.errorMsg });
        }
        dbQueries.retrieveAuthentication(req.body.phoneNumber, fnOnCodeComplete);
    };
    const fnOnCodeComplete = function(err, response){
        if (err){
            return res.status(400).send({ err : err.errorMsg });
        } else {
            let codeFromDatabase = response.value[0].toString();
            if (req.body.phoneCode === codeFromDatabase){
                let authConfirmObj = dataHandler.createVerifiedAuthObj(response);
                dbQueries.setAuthConfirmed(authConfirmObj, fnOnCodeConfirmedComplete);
            }
            else {
                return res.send ({ err: 'Invalid code!' });
            }
        }
    };
    const fnOnCodeConfirmedComplete = function(err){
        if (err){
            return res.status(400).send({ err : err.errorMsg });
        } else {
            return dataHandler.createOrderObj(req, fnOnInputValidateComplete);
        }
    };
    const fnOnInputValidateComplete = function(orderDoc, err){
        if (err){
            return res.status(200).send({ err : err.errorMsg });
        } else {
            return dbQueries.sendOrder(orderDoc, fnOnOrderComplete);
        }
    };
    const fnOnOrderComplete = function(err){
        if (err){
            res.status(400).send({err : err.errorMsg });
        } else {
            return dbQueries.retrieveHistory(phoneNumber, fnOnHistoryRetrieveComplete);
        }
    };
    const fnOnHistoryRetrieveComplete = function(err, response){
        if (err){
            res.status(400).send({ err : err.errorMsg });
        } else {
                let historyObj = dataHandler.createHistoryObj(response);
                if (historyObj === -1) {
                    res.status(400).send({ err : "Pabandykite dar kartą."});
                } else {
                    res.status(200).send(historyObj);
                }
        }
    };
    dataHandler.handleOrderRequest(req, fnOnPhoneValidateComplete);
});

//TODO: error if no phone found
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
        newPassword = dataHandler.generatePassword();
        let resetObj = {
            id: userObj.rows[0].id,
            _rev: userObj.rows[0].value[1],
            password: newPassword,
            phoneNumber : req.body.phoneNumber
        };
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
    let newPassword = '';
    authentication.verifyRecaptcha(req.body.recaptcha, fnOnRecaptchaComplete);
});


