const crypto = require('crypto');

const Validation = function(){

};

const passwordCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

Validation.prototype.validatePhone = function(phoneNumber){
    if (phoneNumber.length === 11){
        if (phoneNumber[0] === '3' && phoneNumber[1] === '7' && phoneNumber [2] === '0'){
            return true;
        }
    }
    return false;
};

Validation.prototype.createOrderObj = function(requestBody){
    let orderObj = {
        dishes: [],
        totalPrice: 0,
        phoneNumber: ''
    };
    orderObj.phoneNumber = requestBody.phoneNumber.replace(/[^0-9]+/, '');
    for (let i = 0; i < requestBody.order.length; i++){
        const currentItem = requestBody.order[i];
        let count = currentItem.count.toString().replace(/[^0-9]+/, '');
        let itemID = currentItem.itemID.toString().replace(/^[a-zA-Z0-9]*$/, '');
        let price = currentItem.price.replace(/[^0-9]+/, '');
        let dish = { count : count, itemID : itemID, price : price };
        orderObj.dishes.push(dish);
    }
    return orderObj;
};

Validation.prototype.createHistoryObj = function(response){
    let parsedResponse = JSON.parse(response);
    let historyObj = { orders : [] };
    parsedResponse.rows.forEach((n) => {
        let order = {};
        order.dishes = n.value[0];
        order.date = new Date(n.value[1]);
        order.price = n.value[2];
        historyObj.orders.push(order);
    });
    return historyObj;
};

Validation.prototype.generatePassword = function(){
    const buf = crypto.randomBytes(8);
    let password = '';
    buf.forEach((char)=>{
        password += passwordCharacters.charAt(char % passwordCharacters.length);
    });
    return password;
};

module.exports = new Validation();