const request = require('request');
const moment = require('moment');
const auth = require('./authentication.js');

//TODO: Move database view names as global constants

const baseDbUrl = 'localhost:5984';
const databaseUrl = 'http://localhost:5984/cafe_example/';
const uuidUrl = 'http://localhost:5984/_uuids';

const Queries = function(){
  this.adminPassword = 'slapt231!';
  this.adminName = 'admin';
  this.adminCookie = '';
  this.expirationTime = 300000; // five minutes
};

Queries.prototype.cookieAuth = function(originalFunction, req, fnOnComplete){
  const path = 'http://' + this.adminName + ':' + this.adminPassword + '@' + baseDbUrl + '/_session';
  const auth = {name: this.adminName, password : this.adminPassword};
  request({
    url: path,
    method: 'POST',
    json: true,
    body: auth,
    headers:{
      'Content-Type': 'application/json',
    }
  }, (error, response)=>{
    if (error || response.statusCode === 401) {
       return fnOnComplete({errorMsg : 'Can\'t access at this time.'});
    }
    this.adminCookie = response.headers['set-cookie'][0].split(';')[0];
    return originalFunction(req, fnOnComplete);
    }
  );
};

Queries.prototype.sendOrder = function(order, fnOnComplete){
    if (!this.adminCookie){
        return this.cookieAuth(this.sendOrder.bind(this), order, fnOnComplete);
    }
    order.date = Date.now();
    request({
        url: databaseUrl,
        method: 'POST',
        json: order,
        headers:{
        'cookie':this.adminCookie
        }
    }, (error, response)=>{
    if (error) {
        return fnOnComplete({errorMsg : 'Cant post to DB'});
    } else if (response.statusCode === 401){
      // authentication fail status code, database cookie has expired
        return this.cookieAuth(this.sendOrder, order, fnOnComplete);
    } else if (201 === response.statusCode){
        return fnOnComplete(null);
    }
    return fnOnComplete({errorMsg : 'Unhandled error!'});
    });
};


Queries.prototype.getDish = function(req, fnOnComplete){
    let orderId = req.query.dishId.replace(/\D/g, '');
    let path = databaseUrl + '_design/cafeData/_view/dishes_by_id?key=' + orderId;
    if (!this.adminCookie){
        return this.cookieAuth(this.getDish.bind(this), req, fnOnComplete);
    }
    if (req.query.dishId === undefined){
        return fnOnComplete({errorMsg: 'Invalid request!', responseCode:400});
    }
    request({
    url: path,
    method: 'GET',
    headers:{
        cookie:this.adminCookie
        }
    }, (error, response, body)=>{
      if (error) {
         return fnOnComplete({errorMsg : 'Database is down, can\'t get Dish', responseCode:500});
    } else if (response.statusCode === 401){
          return this.cookieAuth(this.getDish, req, fnOnComplete);
          } else if (response.statusCode === 404){
          return fnOnComplete({errorMsg : 'Database not found'});
      }
      if (!error && response.statusCode === 200) {
          let parsedBody = JSON.parse(body);
          if (parsedBody.rows.length < 1){
              fnOnComplete({ errorMsg : 'Dish does not exist', responseCode:400 });
          }
          fnOnComplete(null, body);
          }
      });
};

Queries.prototype.placeAuthentication = function(authObj, fnOnComplete){
    if (!this.adminCookie){
        return this.cookieAuth(this.placeAuthentication.bind(this), authObj, fnOnComplete);
    }
    authObj.status = 'unconfirmed';
    authObj.date = Date.now();
    request({
        url: databaseUrl,
        method: 'POST',
        json : authObj,
        headers: {
            'cookie': this.adminCookie
        }
    }, (error, response) =>{
        if ( response.statusCode === 201){
            return fnOnComplete(null, 'Auth request placed', authObj);
        }
        if ( response.statusCode === 401 ){
            return this.cookieAuth(this.placeAuthentication.bind(this), authObj, fnOnComplete);
        }
        else {
            fnOnComplete({errorMsg: "Couldn't place Auth in DB. "});
        }
    });
};

Queries.prototype.retrieveAuthentication = function(phoneNumber, fnOnComplete){
    let now = Date.now();
    let path = 'http://localhost:5984/cafe_example/_design/cafeData/_view/auth_codes_by_phone?limit=1&reduce=false&inclusive_end=true&start_key=["' +
        phoneNumber + '"%2C+'+ now.toString() +']&end_key=["' + phoneNumber + '"%2C+'+ (now - this.expirationTime).toString() +']&descending=true';
    if (!this.adminCookie){
        return this.cookieAuth(this.retrieveAuthentication.bind(this), phoneNumber, fnOnComplete);
    }
    request({
        url: path,
        method: 'GET'
    }, (error, response, body) => {
        if (response.statusCode === 200){
            let parsedBody = JSON.parse(body);
            if (parsedBody.rows && parsedBody.rows.length === 1) {
                return fnOnComplete(null, parsedBody.rows[0]);
            }
            else if (parsedBody.rows && parsedBody.rows.length === 0){
                fnOnComplete({ errorMsg : "auth code expired" });
            }
            else {
                fnOnComplete({ errorMsg : "try again" });
            }
        } else {
            fnOnComplete({ errorMsg : error });
        }
    });
};

Queries.prototype.retrieveHistory = function(phoneNumber, fnOnComplete){
    let path = ('_design/cafeData/_view/history?keys=["' + phoneNumber + '"]');
    if (!this.adminCookie){
        return this.cookieAuth(this.retrieveHistory.bind(this), phoneNumber, fnOnComplete);
    }
    request({
        url: databaseUrl + path,
        method: 'GET',
        headers: {
            cookie: this.adminCookie
            }
    }, (error, response) => {
        if (response.statusCode === 200){
            return fnOnComplete(null, response.body);
        }
        else {
            fnOnComplete({ errorMsg: 'Service not available'});
        }
    });
};

Queries.prototype.retrieveUser = function(phoneNumber, fnOnComplete){
    let path = ('_design/cafeData/_view/users_by_phone?keys=["' + phoneNumber + '"]');
    if (!this.adminCookie){
        return this.cookieAuth(this.retrieveUser.bind(this), phoneNumber, fnOnComplete);
    }
    request({
        url: databaseUrl + path,
        method: 'GET',
        headers: {
            cookie: this.adminCookie
        }
    }, (error, response) => {
        if (response.statusCode === 200){
            return fnOnComplete(null, response.body);
        }
        else {
            fnOnComplete({ errorMsg: 'Service not available'});
        }
    });
};

Queries.prototype.createUser = function(userObj, fnOnComplete){
    if (!this.adminCookie){
        return this.cookieAuth(this.createUser.bind(this), phoneNumber, fnOnComplete);
    }
    request({
        url: databaseUrl,
        method: 'POST',
        headers: {
            cookie: this.adminCookie
        }
    }, (error, response)=> {
        if (response.statusCode === 201){
            return fnOnComplete(null, userObj);
        }
        else {
            fnOnComplete({ errorMsg: 'Service not available'});
        }
    });
};

Queries.prototype.replaceUserDocument = function(userObj, fnOnComplete){
    if (!this.adminCookie) {
        return this.cookieAuth(this.replaceUserDocument.bind(this), userObj, fnOnComplete);
    }
    request({
        url: databaseUrl + userObj.id,
        method: 'PUT',
        json: userObj,
        headers:{
            'cookie':this.adminCookie
        }
    }, (error, response) => {
        if (response.statusCode === 201){
            return fnOnComplete(null, 'OK');
        }
        else {
            fnOnComplete({ errorMsg: 'Service not available'});
        }
    });
};

Queries.prototype.setAuthConfirmed = function(authObj, fnOnComplete){
    if (!this.adminCookie){
        return this.cookieAuth(this.setAuthConfirmed.bind(this), authObj, fnOnComplete);
    }
    request({
        url: databaseUrl + authObj.id,
        method: 'PUT',
        json: authObj,
        headers: {
            cookie: this.adminCookie
        }
    }, (error, response) => {
        if (response.statusCode === 201){
            return fnOnComplete(null, 'OK');
        }
        else {
            fnOnComplete({ errorMsg: 'Service not available. '});
        }
    });
};

Queries.prototype.retrieveMenu = function(placeHolder, fnOnComplete){
    if (!this.adminCookie){
        return this.cookieAuth(this.retrieveMenu.bind(this), placeHolder, fnOnComplete);
    }
    request({
        url: databaseUrl + '_design/cafeData/_view/all_dishes',
        method: 'GET',
        headers: {
            cookie: this.adminCookie
        }
    }, (error, response) => {
        if (response.statusCode === 200){
            return fnOnComplete(null, response.body);
        } else {
            return { errorMsg : 'Service not available' , responseCode: 400};
        }
    })
};

module.exports = new Queries();
