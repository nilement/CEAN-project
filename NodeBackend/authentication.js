var uuidV4 = require('uuid/v4');
var jwt = require('jsonwebtoken');
var request = require('request');

var Authentication = function(){
    this.secretKey = 'mySecret';
    this.recaptchaSecret = '6LdCmh0UAAAAAMgi96xrfXfyXA2PyhsLzs_r_2hr';
};

Authentication.prototype.verifyRecaptcha = function(captchaResponse, successFn){
    request({
        url: 'https://www.google.com/recaptcha/api/siteverify',
        method: 'POST',
        form:{
            secret: this.recaptchaSecret,
            response: captchaResponse
        }
    }, function (error, response, body) {
        var googleResponse = JSON.parse(body);
        if (error) {
                console.log('Error!: ' + error);
                successFn('Something is wrong!');
        } else {
            if (googleResponse.success === true){
                console.log('User is human!');
                successFn(null);
            }
            else{
                successFn('Something is wrong!');
            }
        }
    });
}

Authentication.prototype.generateCode = function(){
    var code = 1234;
    return code;
}

Authentication.prototype.issueCookie = function(phone){
    var token = jwt.sign({phoneNumber:phone, code:1234}, this.secretKey);
    var decoded = jwt.verify(token, this.secretKey);
    console.log('token is : '+ token);
    console.log('decoded is : ' + decoded.phoneNumber);
    console.log('decoded is : ' + decoded.code);
    return token;
};

module.exports = new Authentication();
