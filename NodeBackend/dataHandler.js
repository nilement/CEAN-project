const crypto = require('crypto');
const moment = require('moment');
const validator = require('validator');
const util = require('util');

const DataHandler = function(){

};

const passwordCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

DataHandler.prototype.generateCode = function(){
    return Math.floor(Math.random()* 9000 + 1000);
};

DataHandler.prototype.createVerifiedAuthObj = function(response){
    return {
        id : response.id,
        code: response.value[0],
        _rev: response.value[1],
        phoneNumber: response.key[0],
        date: response.key[1],
        status: 'confirmed'
    };
};

DataHandler.prototype.handleOrderRequest = function(req, fnOnValidateComplete){
    req.checkBody('phoneCode', null).notEmpty().isInt({ min: 0, max: 9999 });
    req.checkBody('phoneNumber', null).notEmpty().isInt();
    req.getValidationResult().then((result) => {
        if (result.isEmpty()) {
            fnOnValidateComplete(null);
        } else {
            fnOnValidateComplete({ errorMsg : "Invalid request data!" });
        }
    });
};

DataHandler.prototype.createOrderObj = function(req, fnOnComplete){
    let orderObj = {
        dishes: [],
        totalPrice: 0,
        phoneNumber: ''
    };
    req.checkBody('phoneNumber', null).notEmpty().isInt();
    req.checkBody('order', null).notEmpty();
    req.getValidationResult().then(function(result){
        if (!result.isEmpty()){
            return fnOnComplete({ errorMsg : 'Invalid data!' });
        }
        orderObj.phoneNumber = req.body.phoneNumber;
        for (let key in req.body.order){
            if (req.body.order.hasOwnProperty(key)) {
                let item = req.body.order[key];
                let count = item.count.toString().replace(/[^0-9]+/, '');
                let name = item.name.toString().replace(/[^a-zA-Z]+/, '');
                let itemID = item.itemID.toString().replace(/^[^a-zA-Z0-9]*$/, '');
                let price = item.price.toString().replace(/[^0-9.]+/, '');
                let dish = {count: count, itemID: itemID, price: price, name: name};
                orderObj.totalPrice = (parseFloat(orderObj.totalPrice) + parseFloat(item.price) * item.count).toFixed(2);
                orderObj.dishes.push(dish);
            }
        };
        return fnOnComplete (null, orderObj);
    });
};

DataHandler.prototype.createHistoryObj = function(response){
    let parsedResponse = JSON.parse(response);
    if (parsedResponse.rows.length === 0){
        return -1;
    }
    let historyObj = { orders : [] };
    parsedResponse.rows.forEach((n) => {
        let order = {};
        let dateObj = moment(n.value[1]);
        order.dishes = n.value[0];
        order.date = dateObj.format('DD-MM-YY, h:mm');
        order.price = n.value[2];
        historyObj.orders.push(order);
    });
    return historyObj;
};

DataHandler.prototype.createMenuObj = function(rows){
    let parsedRows = JSON.parse(rows).rows;
    let menuObj = {};
    let iterator = 0;
    for (;iterator < parsedRows.length; iterator++){
        let ptr = parsedRows[iterator].value;
        let dish = {
            name: ptr[0],
            itemID: ptr[1],
            price: ptr[2],
            imageLink : ptr[3]
        };
        if (menuObj[parsedRows[iterator].key] === undefined){
            menuObj[parsedRows[iterator].key] = {};
            menuObj[parsedRows[iterator].key].dishes = [];
            menuObj[parsedRows[iterator].key].category = parsedRows[iterator].key;
        }
        menuObj[parsedRows[iterator].key].dishes.push(dish);
    }
    return menuObj;
};

DataHandler.prototype.generatePassword = function(){
    const buf = crypto.randomBytes(8);
    let password = '';
    buf.forEach((char)=>{
        password += passwordCharacters.charAt(char % passwordCharacters.length);
    });
    return password;
};

DataHandler.prototype.handleDishQuery = function(req, fnOnValidate) {
    req.checkQuery('dishId', null).notEmpty().isInt();
    req.getValidationResult().then(function(result){
       if (!result.isEmpty()){
           return fnOnValidate({ errorMsg : "Invalid input!" });
       }
       return fnOnValidate(null);
    });
};

DataHandler.prototype.handleAuthRequest = function(req, fnOnValidate){
    req.checkBody('phoneNumber', null).isInt();
    req.getValidationResult().then((result) => {
        if (result.isEmpty()){
            let code;
            if (process.env.NODE_ENV === 'development'){
                code = process.env.TEST_AUTH_CODE;
            } else {
                code = this.generateCode();
            };
            return fnOnValidate(null, { phoneNumber : req.body.phoneNumber, code: code});
        } else {
            return fnOnValidate({ errorMsg : "Invalid phoneNumber! "});
        }
    });
};

module.exports = new DataHandler();