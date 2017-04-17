var assert = chai.assert;

describe('httpService using $httpBackend mock', function(){
  var address = 'http://localhost:5000';
  var httpService;
  var $q, $httpBackend;

  beforeEach(function() {
    module('menuApp');
    inject(function (_$q_, _$httpBackend_, _httpService_) {
      $q = _$q_;
      $httpBackend = _$httpBackend_;
      httpService = _httpService_;
    });
  });

  it('should return array of dishes from HTTP GET /api/getMenus', function(){
    var data = {rows : [{value:1.23, key:'testinis1'}, {value:4.56, key:'testinis2'}]};
    $httpBackend.when('GET', address+'/api/getMenus')
      .respond(data);
    httpService.getMenu().then(function(response){
      assert.equal(response.data.length, 2);
    });
    $httpBackend.flush();
  });

  it('should return array of orders from HTTP GET /api/getUserOrders?id=testName', function(){
    var data = {rows : [{buyer:'testeris1', dishes:[ {name:'alus', count:3}]},
      {buyer:'testeris1', dishes:[ {name:'nealkoholinis alus', count:4}]}]};
    $httpBackend.when('GET', address+'/api/getUserOrders?name=testName')
      .respond(data);
    httpService.getUserOrders('testName').then(function(response){
      assert.equal(response.length, 2);
    });
    $httpBackend.flush();
  });

  it('should return success message object from HTTP POST /api/deleteOrder?id=testName', function(){
    var success = 'successfully deleted';
    $httpBackend.when('POST', address+'/api/deleteOrder?id=testName')
      .respond(success);
    httpService.cancelOrder('testName').then(function(response){
      assert.equal(response, 'successfully deleted');
    });
    $httpBackend.flush();
  });

  it('should return success message object from HTTP POST /api/postOrder', function(){
    var orderObj = {dishes:[{name:'testFood', count:2, price:13.37}, {name:'testFood2', count:0xB, price:0xA}],
      buyer:'pirkejas'};
    var success = 'posted pirkejas';
    $httpBackend.when('POST', address+'/api/postOrder').
      respond(success);
    httpService.sendOrder(orderObj).then(function(response){
      assert.equal(response.data, 'posted pirkejas');
    });
    $httpBackend.flush();
  });

});
