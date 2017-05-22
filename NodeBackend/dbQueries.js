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
};

// called when cookie is not found
// params:
// func - function that called for authentication check
// req - initial HTTP request
// fnOnComplete - final completion function that calls HTTP response
// sends local admin data to DB for cookie retrieval
// originalFunction = function(req, fnOnComplete)
Queries.prototype.cookieAuth = function(originalFunction, req, fnOnComplete){
  // URL for CouchDB admin cookie retrieval
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

Queries.prototype.postOrder = function(order, fnOnComplete){
  if (!this.adminCookie){
    return this.cookieAuth(this.postOrder.bind(this), order, fnOnComplete);
  }
    order.deleted = false;
    request({
      // first retrieve a uuid for new order
      url: uuidUrl,
      method: 'GET',
      headers:{
        cookie:this.adminCookie
        }
    }, (error, response, body)=>{
      if (error){
        return fnOnComplete({ errorMsg : 'Cant retrieve UUID' });
      }
      if (response.statusCode !== 200){
        return fnOnComplete({errorMsg : 'Unhandled error retrieving UUID!'});
      }
      let uuid = JSON.parse(body).uuids[0];
      request({
        // valid uuid received, now place the order
        url: databaseUrl + uuid,
        method: 'PUT',
        json: order,
        headers:{
        'cookie':this.adminCookie
          }
        }, (error, response)=>{
          console.log(response.statusCode);
          if (error) {
             return fnOnComplete({errorMsg : 'Cant post to DB'});
          } else if (response.statusCode === 401){
            // authentication fail status code, database cookie has expired
            return this.cookieAuth(this.postOrder, order, fnOnComplete);
          } else if (response.statusCode === 201){
            return fnOnComplete(null, 'Succesfully posted order #: ' + uuid + ' to DB');
          }
          return fnOnComplete({errorMsg : 'Unhandled error!'});
        });
  });
};


Queries.prototype.getDish = function(req, fnOnComplete){
  if (!this.adminCookie){
    return this.cookieAuth(this.getDish.bind(this), req, fnOnComplete);
  }
  if (req.query.dishId === undefined){
    return fnOnComplete({errorMsg: 'Invalid request!', responseCode:400});
  }
  let orderId = req.query.dishId.replace(/\D/g, '');
  let path = databaseUrl + '_design/cafeData/_view/dishes_by_id?key=' + orderId;
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
          fnOnComplete(null, body);
          }
      });
};

Queries.prototype.getOrders = function(req, fnOnComplete){
  if (!this.adminCookie){
    return this.cookieAuth(this.getOrders.bind(this), req, fnOnComplete);
  }
  // order name must consist only of alphabet characters
  let orderName = req.query.name.replace(/\W/g,'');
  let path =  databaseUrl + '_design/cafeData/_view/dishes_by_id?key='+ '\"' + orderName + '\"';
  request({
    url: path,
    method: 'GET',
    headers:{
        'cookie':this.adminCookie
        }
  }, (error, response, body)=>{
    if (error){
      return fnOnComplete({errorMsg: 'User history can\'t be retrieved.', responseCode:500});
    } else if (response.statusCode === 401){
          return this.cookieAuth(this.getOrders.bind(this), req, fnOnComplete);
        }
    fnOnComplete(null, body);
  });
};

Queries.prototype.deleteOrder = function(req, fnOnComplete){
  if (!this.adminCookie){
    return this.cookieAuth(this.deleteOrder.bind(this), req, fnOnComplete);
  }
  // order id must consist only of digits and letters
  let orderId = req.query.id.replace(/\W/g,'');
  let path = databaseUrl + orderId;
  request({
    // to set deleted on order it must be created anew with changed property
    url: path,
    method: 'GET',
    headers:{
        'cookie':this.adminCookie
        }
    }, (error, response, body)=>{
      if (error) {
      return fnOnComplete({errorMsg: "Can't find order in DB. "});
    } else if (response.statusCode === 401){
          return this.cookieAuth(this.deleteOrder.bind(this), req, fnOnComplete);
        }
      let orderFromDb = JSON.parse(body); // rebuild order
      orderFromDb.deleted = true;
      request({  // rewrite the order
        url: path,
        method: 'PUT',
        json : orderFromDb,
        headers:{
        'cookie':this.adminCookie
        }
      }, (error, response)=>{
        if (error) {
           fnOnComplete({errorMsg: "Couldn't delete in DB. "}); return;
          } else if (response.statusCode === 401){
              return this.cookieAuth(this.deleteOrder.bind(this), req, fnOnComplete);
        }
        fnOnComplete(null, 'Deleted order: ' + req.query.id);
      });
    });
};

Queries.prototype.placeAuthentication = function(authObj, fnOnComplete){
    if (!this.adminCookie){
        return this.cookieAuth(this.placeAuthentication.bind(this), authObj, fnOnComplete);
    }
    request({
        url: uuidUrl,
        method: 'GET',
        headers: {
            cookie: this.adminCookie
        }
    }, (error, response, body) => {
        let uuid;
        if (response.statusCode === 200){
            uuid = JSON.parse(body).uuids[0];
            authObj.status = 'unconfirmed';
//            let date = moment().toObject();
//            date.months += 1;
            authObj.date = Date.now();
        }
        else {
            return fnOnComplete({errorMsg: 'Unhandled error retrieving UUID!'});
        }
        request({
            url: databaseUrl + uuid,
            method: 'PUT',
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
    });
};

Queries.prototype.retrieveAuth = function(phoneNumber, fnOnComplete){
    if (!this.adminCookie){
        return this.cookieAuth(this.retrieveAuth.bind(this), phoneNumber, fnOnComplete);
    }
    // here goes sanitisation
    let now = Date.now();
    let fiveMinAgo = now - 300000; // 5 minutes * 60 seconds * 1000 ms in second
    let path = 'http://localhost:5984/cafe_example/_design/cafeData/_view/auth_codes_by_phone?limit=1&reduce=false&inclusive_end=true&start_key=["' +
        phoneNumber + '"%2C+'+ now.toString() +']&end_key=["' + phoneNumber + '"%2C+'+ fiveMinAgo.toString() +']&descending=true';
    //console.log(path)
    request({
        url: path,
        method: 'GET'
    }, (error, response, body) => {
        //console.log(response.statusCode)
        if (response.statusCode === 200){
            let parsedBody = JSON.parse(body);
            if (parsedBody.rows && parsedBody.rows.length === 1) {
                return fnOnComplete(null, parsedBody.rows[0]);
            }
            else if (parsedBody.rows && parsedBody.rows.length === 0){
                fnOnComplete({ err : "auth code expired" });
            }
            else {
                fnOnComplete({ err : "try again" });
            }
        } else {
            fnOnComplete({ err : error });
        }
    });
};

Queries.prototype.testAuthentication = function(fnOnComplete){
    if (!this.adminCookie){
        return this.cookieAuth(this.testAuthentication.bind(this), fnOnComplete);
    }

    let authObj = {
        phoneNumber : '860401484',//auth.generateCode().toString() + auth.generateCode().toString(),
        code : auth.generateCode()
    };
    console.log(authObj.code);
    request({
        url: uuidUrl,
        method: 'GET',
        headers: {
            cookie: this.adminCookie
        }
    }, (error, response, body) => {
        let uuid;
        if (response.statusCode === 200){
            uuid = JSON.parse(body).uuids[0];
            authObj.status = 'unconfirmed';
//            let date = moment().toObject();
//            date.months += 1;
            authObj.date = Date.now();
        }
        else {
            return fnOnComplete({errorMsg: 'Unhandled error retrieving UUID!'});
        }
        request({
            url: databaseUrl + uuid,
            method: 'PUT',
            json : authObj,
            headers: {
                'cookie': this.adminCookie
            }
        }, (error, response) =>{
            if ( response.statusCode === 201){
                return fnOnComplete(null, 'Auth request placed', authObj);
            }
            if ( response.statusCode === 401 ){
                return this.cookieAuth(this.testAuthentication.bind(this), fnOnComplete);
            }
            else {
                fnOnComplete({errorMsg: "Couldn't place Auth in DB. "});
            }
        });
    });
};

module.exports = new Queries();
