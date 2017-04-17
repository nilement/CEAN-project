var assert = chai.assert;

describe('MainController', function(){
  var scope, controller, $q, vm;
  var menuDeffered, userDeffered, orderDeffered;
  var mockHttpService, mockDish;

  beforeEach(function(){
    module('menuApp')
  });

  beforeEach(function() {
    inject(function ($rootScope, $controller, _$q_) {
      scope = $rootScope.$new();
      controller = $controller;
      $q = _$q_;
    });
  });

  it('should create a controller and inject mockHttpService', function(){
    mockHttpService = {
      getMenu: function () {
        menuDeffered = $q.defer();
        return menuDeffered.promise;
      },
      getUserOrders : function(user){
        userDeffered = $q.defer();
        return userDeffered.promise;
      },
      sendOrder : function(order){
        orderDeffered = $q.defer();
        return orderDeffered.promise;
      }
    };
    vm = controller('MainController', {$scope : scope, httpService : mockHttpService});
    assert.isDefined(vm);
  });

  it('should add array of items to controller menu', function() {
    var data = {data: [ {first:'1'}, { second:'2'}, { third: '3'} ]};
    vm.getMenu();
    menuDeffered.resolve(data);
    scope.$digest();
    assert.equal(vm.menu.length, 3);
    assert.equal(vm.menuRetrieved, 2);
  });

  it('should insert two dishes from menu to cart', function(){
    var dish = { name : 'testas', price : 3.33};
    mockDish = { name : 'antrasTestas', price : 6.66};
    vm.addDish(dish);
    vm.addDish(mockDish);
    assert.equal(vm.basket.length, 2);
  });

  it('should remove one dish from cart', function(){
    vm.removeDish(mockDish);
    assert.equal(vm.basket.length, 1);
  });

  it('should put order to confirmation area', function(){
    vm.finishOrder();
    assert.equal(vm.basket.length, 0);
    assert.equal(vm.order.length, 1);
  });

  it('should invoke http post to send order and alert success', function(){
    var alert = sinon.stub(window, 'alert');
    var data = {data:"Fine"};
    vm.sendOrders();
    orderDeffered.resolve(data);
    scope.$digest();
    assert.equal(vm.order.length, 0);
    sinon.assert.calledWith(alert, 'Fine');
  });

  it('should invoke http get for user orders', function(){
    var id = 'test';
    var data = [{name:'test'}];
    vm.getUserOrders(id);
    userDeffered.resolve(data);
    scope.$digest();
    assert.equal(vm.history.length, 1);
    assert.equal(vm.noOrdersFound, false);
  });
});
