const Validation = function(){

};

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
    for (let i = 0; i < requestBody.dishes.length; i++){
        let currentItem = requestBody.dishes[i];
        let count = currentItem.count.replace(/[^0-9]+/, '');
        let itemID = currentItem.dish.replace(/^[a-zA-Z0-9]*$/, '');
        let price = currentItem.price.replace(/[^0-9]+/, '');
        let dish = { count : count, itemID : itemID, price : price };
        orderObj.dishes.push(dish);
    }
    return orderObj;
};

module.exports = new Validation();