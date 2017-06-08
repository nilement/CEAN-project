const request = require('request');

const Authentication = function(){
    this.recaptchaSecret = '6LdCmh0UAAAAAMgi96xrfXfyXA2PyhsLzs_r_2hr';
};

Authentication.prototype.verifyRecaptcha = function(recaptcha, successFn){
    if (recaptcha === undefined ){
        return successFn({ errorMsg : 'Recaptcha not included!' });
    }
    request({
        url: 'https://www.google.com/recaptcha/api/siteverify',
        method: 'POST',
        form:{
            secret: this.recaptchaSecret,
            response: recaptcha
        }
    }, function (error, response, body) {
        let googleResponse = JSON.parse(body);
        if (error) {
                successFn({ errorMsg : 'Service unavailable!' });
        } else {
            if (googleResponse.success === true){
                successFn(null);
            }
            else{
                successFn({ errorMsg : 'Recaptcha is invalid!' });
            }
        }
    });
};

module.exports = new Authentication();
