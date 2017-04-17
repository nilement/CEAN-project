var request = require('request');
var twilioAPI = require('./twilioAPI.js');

var baseDbUrl = 'localhost:5984';
var databaseUrl = 'http://localhost:5984/cafe_example/';
var uuidUrl = 'http://localhost:5984/_uuids';

var Queries = function(){
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
  var path = 'http://' + this.adminName + ':' + this.adminPassword + '@' + baseDbUrl + '/_session';
  var auth = {name: this.adminName, password : this.adminPassword};
  request({
    url: path,
    method: 'POST',
    json: true,
    body: auth,
    headers:{
      'Content-Type': 'application/json',
    }
  }, (error, response, body)=>{
    if (error || response.statusCode === 401) {
       return fnOnComplete({errorMsg : 'Can\'t access at this time.'});
    }
    this.adminCookie = response.headers['set-cookie'][0].split(';')[0];
    return originalFunction(req, fnOnComplete);
    }
  );
};

Queries.prototype.postOrder = function(req, fnOnComplete){
  if (!this.adminCookie){
    return this.cookieAuth(this.postOrder.bind(this), req, fnOnComplete);
  }
    request({
      // first retrieve a uuid for new order
      url: uuidUrl,
      method: 'GET',
      headers:{
        cookie:this.adminCookie
        }
    }, (error, response, body)=>{
      if (error){
        return fnOnComplete({errorMsg : "Can't retrieve UUID"});
      }
      if (response.statusCode !== 200){
        return fnOnComplete({errorMsg : 'Unhandled error retrieving UUID!'});
      }
      req.body.deleted = false;
      var uuid = JSON.parse(body).uuids[0];
      request({
        // valid uuid received, now place the order
        url: databaseUrl + uuid,
        method: 'PUT',
        json: req.body,
        headers:{
        'cookie':this.adminCookie
          }
        }, (error, response, body)=>{
          if (error) {
             return fnOnComplete({errorMsg : 'Cant post to DB'});
          } else if (response.statusCode === 401){
            // authentication fail status code, database cookie has expired
            return this.cookieAuth(this.postOrder, req, fnOnComplete);
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
    return fnOnComplete({errorMsg: 'Invalid request!'});
  }
  var orderId = req.query.dishId.replace(/\D/g, '');
  var path = databaseUrl + '_design/cafeData/_view/prices?key=' + orderId;
  request({
    url: path,
    method: 'GET',
    headers:{
        cookie:this.adminCookie
        }
    }, (error, response, body)=>{
      if (error) {
         return fnOnComplete({errorMsg : 'Database is down, can\'t get Dish'});
    } else if (response.statusCode === 401){
          return this.cookieAuth(this.getDish, req, fnOnComplete);
          } else if (response.statusCode === 404){
          fnOnComplete({errorMsg : 'Database not found'});
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
  var orderName = req.query.name.replace(/\W/g,'');
  var path =  databaseUrl + '_design/cafeData/_view/name_view?key='+ '\"' + orderName + '\"';
  request({
    url: path,
    method: 'GET',
    headers:{
        'cookie':this.adminCookie
        }
  }, (error, response, body)=>{
    if (error){
      return fnOnComplete({errorMsg: 'User history can\'t be retrieved.'});
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
  var orderId = req.query.id.replace(/\W/g,'');
  var path = databaseUrl + orderId;
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
      var orderFromDb = JSON.parse(body); // rebuild order
      orderFromDb.deleted = true;
      request({  // rewrite the order
        url: path,
        method: 'PUT',
        json : orderFromDb,
        headers:{
        'cookie':this.adminCookie
        }
      }, (error, response, body)=>{ // OVERLAPING PARAMETERS!!!
        if (error) {
           fnOnComplete({errorMsg: "Couldn't delete in DB. "}); return;
          } else if (response.statusCode === 401){
              return this.cookieAuth(this.deleteOrder.bind(this), req, fnOnComplete);
        }
        fnOnComplete(null, 'Deleted order: ' + req.query.id);
      });
    });
};

module.exports = new Queries();
