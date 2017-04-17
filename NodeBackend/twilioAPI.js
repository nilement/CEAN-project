var twilio = require ( 'twilio' ) ;

var TwilioApi = function(){
    this.testSid = 'AC6eb001698db284cdc449605568b7f7d7';
    this.testToken = 'e7b1522157d561a7aa248e888163153e';
    this.client = new twilio.RestClient(this.testSid, this.testToken);
};

TwilioApi.prototype.sendMessage = function(authCode){
    this.client.messages.create({
    body: authCode,
    to: '+37060401484',
    from: '+370 668 41460'
}, function(err, message){
        if (err){
            console.log(err)
        } else {
            console.log(message.sid);
        }
    });
};

module.exports = new TwilioApi();
