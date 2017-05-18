var chai = require('chai');
var request = require('request');

var assert = chai.assert;

describe('connection toCouchDB', function(){
    var dbQueries = require('../dbQueries.js');
    var uuid = '';
    var rev = '';
    var postRequest = {body : {buyer:'test', dishes:{test:'test'}}};
    it('retrieves adminCookie', function(done){
        dbQueries.cookieAuth(function(){
            assert.equal(dbQueries.adminCookie.length, 59);
            done();
        });
    });
    it('posts order', function(done){
        dbQueries.postOrder(postRequest, function(errorMsg, message){
            uuid = message.substring(28,60);
            assert.equal(errorMsg, null);
            assert.equal(message, 'Succesfully posted order #: ' + uuid + ' to DB');
            done();
        });
    });
    it('adds deleted field to posted order', function(done){
       var uuidObj = {query : {id : uuid}};
       dbQueries.deleteOrder(uuidObj, function(errorMsg, message){
           assert.equal(errorMsg, null);
           assert.equal(message, 'Deleted order: ' + uuid);
           request({
            url: 'http://localhost:5984/cafe_example/'+uuid,
            method: 'GET',
            headers:{
                'cookie':dbQueries.adminCookie
                }
            }, (error, response, body)=>{
                var bod = JSON.parse(body);
                rev = bod._rev;
                assert.equal(error, null);
                assert.equal(bod.deleted, true);
                done();
           });
       });
    });
    it('removes it from database', function(done){
        request({
            url: 'http://localhost:5984/cafe_example/'+uuid+'?rev='+rev,
            method: 'DELETE',
            headers:{
                'cookie':dbQueries.adminCookie
                }
            }, (error, response, body)=>{
                assert.equal(error, null);
                assert.equal(JSON.parse(body).ok, true);
                done();
           });
    });
    /*it('adds authentication document to database', function(done){
       request({

       });
    });*/
});

