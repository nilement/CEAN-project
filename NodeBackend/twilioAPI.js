var twilio = require ( 'twilio' ) ;

var TwilioApi = function(){
    this.testSid = 'AC6eb001698db284cdc449605568b7f7d7';
    this.testToken = 'e7b1522157d561a7aa248e888163153e';
    this.client = new twilio.RestClient(this.testSid, this.testToken);
};

TwilioApi.prototype.sendMessage = function(message, phoneNumber, fnOnComplete){
    this.client.messages.create({
        body: message,
        to: phoneNumber,
        from: '+370 668 41460'
    }, function(err){
        if (err){
            fnOnComplete('Failed to send: ' + err);
        } else {
            fnOnComplete(null, 'Išsiųsta!');
        }
    });
};

TwilioApi.prototype.phoneLookup = function(phoneNumber){
    var client = new twilio.LookupsClient(this.testSid, this.testToken);
    client.phoneNumbers(phoneNumber).get({
        type: 'carrier'
    }, function (error, number)  {
        var message = number ? number.national_format + ' is valid' : error;
    if (error && error.status === 404) {
        return false;
    }
    if (number.country_code != "LT"){
        console.log("Užsakymai tik Lietuvoje");
        return false;
    }
    console.log(message);
    return true;
    });
}

module.exports = new TwilioApi();
