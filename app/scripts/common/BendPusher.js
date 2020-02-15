'use strict'

angular
  .module('app.pusher', [])
  .factory('BendPusher', function ($bend, $rootScope, $location, CommonUtil) {
      var BendPusher = {};
      BendPusher.APP_KEY = "5719852d4bad30792303536e";
      BendPusher.APP_SECRET = "hrn6AsF5Mvev9gyFrdBWfLX4RNh0e0RWkOEo2oVh";
      BendPusher.initialized = false;

      BendPusher.init = function(callback) {
        if(BendPusher.initialized)
          return false;
        $bend.Pusher.init(BendPusher.receiveMessage, BendPusher.didConnect, BendPusher.didDisconnect).then(function(result) {
          console.log("Pusher Init Response", result);
          if(callback)
            callback();
        }, function(error) {
          console.log("Pusher Initialize Error", error);
        });
      };

      BendPusher.subscribe = function(msg, callback) {
        $bend.Pusher.subscribe(msg).then(function(result) {
          console.log(result);
          if(callback)
            callback(result);
        }, function(error) {
          console.log("", error);
        });
      };

      BendPusher.push = function(event, channel, data, callback) {
        $bend.Pusher.push(event, channel, data).then(function(result) {
          if(callback)
            callback(result);
        }, function(error) {
          console.log("", error);
        });
      };

      BendPusher.receiveMessage = function (msg) {
        console.log('BendPusher.receiveMessage', msg);
        var jsMsg = JSON.parse(msg);
        if (jsMsg.id == 1) {

          return;
        }
      }
      BendPusher.didConnect = function () {
        var token = $bend.getActiveUser()._bmd.authtoken;
        $bend.Pusher.login(token, BendPusher.APP_KEY).then(function(result) {
          BendPusher.initialized = true;
          console.log("BendPusher.didConnect", result);
        }, function(error) {
          console.log(error);
        });
      };
      BendPusher.didDisconnect = function () {
        console.log("BendPusher.didDisconnect");
        BendPusher.initialized = false;
      };

      return BendPusher;
    }
  );
