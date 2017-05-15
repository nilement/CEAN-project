const request = require('request');

const Authentication = function(){
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
        let googleResponse = JSON.parse(body);
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
};

Authentication.prototype.generateCode = function(){
    return Math.floor(Math.random()* 9000 + 1000);
};


module.exports = new Authentication();
