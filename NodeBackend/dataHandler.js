const crypto = require('crypto');
const moment = require('moment');

const DataHandler = function(){

};

const passwordCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

DataHandler.prototype.validatePhone = function(phoneNumber){
    if (phoneNumber.length === 11){
        if (phoneNumber[0] === '3' && phoneNumber[1] === '7' && phoneNumber [2] === '0'){
            return true;
        }
    }
    return false;
};

DataHandler.prototype.createOrderObj = function(requestBody){
    let orderObj = {
        dishes: [],
        totalPrice: 0,
        phoneNumber: ''
    };
    orderObj.phoneNumber = requestBody.phoneNumber.replace(/[^0-9]+/, '');
    for (let key in requestBody.order){
        if (requestBody.order.hasOwnProperty(key)) {
            let item = requestBody.order[key];
            let count = item.count.toString().replace(/[^0-9]+/, '');
            let name = item.name.toString().replace(/[^a-zA-Z]+/, '');
            let itemID = item.itemID.toString().replace(/^[^a-zA-Z0-9]*$/, '');
            let price = item.price.toString().replace(/[^0-9.]+/, '');
            let dish = {count: count, itemID: itemID, price: price, name: name};
            orderObj.totalPrice = (parseFloat(orderObj.totalPrice) + parseFloat(item.price) * item.count).toFixed(2);
            orderObj.dishes.push(dish);
        }
    };
    return orderObj;
};

DataHandler.prototype.createHistoryObj = function(response){
    let parsedResponse = JSON.parse(response);
    if (parsedResponse.rows.length === 0){
        return -1;
    }
    let historyObj = { orders : [] };
    parsedResponse.rows.forEach((n) => {
        console.log(n);
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

module.exports = new DataHandler();