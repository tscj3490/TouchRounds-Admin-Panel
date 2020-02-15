'use strict'

angular
  .module('app.auth', [])
  .factory('BendAuthBootstrap', ['$bend', function($bend){
    return {
      APP_KEY: "touchround",
      APP_SECRET: "topsecret",
      APP_ADMIN_GROUP: "admin",
      APP_URL: "" +
      "",

      //Production
      //APP_KEY: "enterHere",
      //APP_SECRET: "enterHere",
      //APP_ADMIN_GROUP: "577625462bfca8009b00343c",
      //APP_URL: "https://api.touchrounds.com/group/",


      checkAuthToken: function(callback) {
        callback = callback || function() {};

        var expiresIn = 1*60*60*1000; // ~1 hours.
        Bend.appKey = this.APP_KEY;
        $bend.LocalStorage.get("tokenLastUsedTime").then(function(timestamp){
          if(timestamp) {
            var diff=Date.now()-parseInt(timestamp);
            if(diff>expiresIn) {
              console.log("Token has been expired!")
              $bend.LocalStorage.destroy('activeUser');
            }

            callback(null);
            return;
          }

          callback(null);
        },function(error){ callback(error); });
      },
      bootstrapService: function() {
        var that = this;
        this.checkAuthToken(function(error) {
          if (error) {
            console.log(error);
          }

          $bend.init({
            appKey: that.APP_KEY,
            appSecret: that.APP_SECRET
          }).then(
            function (activeUser) {
              console.log("init bend");
              angular.bootstrap(document.getElementById('app'), ['themesApp']);
              if(activeUser) {

              }
            },
            function (error) {
              console.log(error);
              angular.bootstrap(document.getElementById('app'), ['themesApp'])
            }
          );
        });
      }
    }
  }])
  .factory('rememberMeService', function () {
    function fetchValue(name) {
      var gCookieVal = document.cookie.split("; ");
      for (var i = 0; i < gCookieVal.length; i++) {
        // a name/value pair (a crumb) is separated by an equal sign
        var gCrumb = gCookieVal[i].split("=");
        if (name === gCrumb[0]) {
          var value = '';
          try {
            value = angular.fromJson(gCrumb[1]);
          } catch (e) {
            value = unescape(gCrumb[1]);
          }
          return value;
        }
      }
      // a cookie with the requested name does not exist
      return null;
    }
    return function (name, values) {
      if (arguments.length === 1) return fetchValue(name);
      var cookie = name + '=';
      if (typeof values === 'object') {
        var expires = '';
        cookie += (typeof values.value === 'object') ? angular.toJson(values.value) + ';' : values.value + ';';
        if (values.expires) {
          var date = new Date();
          date.setTime(date.getTime() + (values.expires * 24 * 60 * 60 * 1000));
          expires = date.toGMTString();
        }
        cookie += (!values.session) ? 'expires=' + expires + ';' : '';
        cookie += (values.path) ? 'path=' + values.path + ';' : '';
        cookie += (values.secure) ? 'secure;' : '';
      } else {
        cookie += values + ';';
      }
      document.cookie = cookie;
    }
  })
  .factory('BendAuth', [
    '$location', '$http', '$bend','BendAuthBootstrap','BendPusher', '$rootScope', 'rememberMeService',function ($location, $http, $bend, BendAuthBootstrap, BendPusher, $rootScope, rememberMeService) {
      var BendAuth = {};


      //Testing
      BendAuth.APP_KEY = BendAuthBootstrap.APP_KEY;
      BendAuth.APP_SECRET = BendAuthBootstrap.APP_SECRET;
      BendAuth.GROUP_ID = BendAuthBootstrap.APP_ADMIN_GROUP;
      BendAuth.URL = BendAuthBootstrap.APP_URL;

      //Production
      //BendAuth.APP_KEY = '?';
      //BendAuth.APP_SECRET = '?';
      //BendAuth.GROUP_ID = "577625462bfca8009b00343c";

      BendAuth.bootstrapService = function() {
        console.log("BendAuth.bootstrapService");
        var $bend = initInjector.get('$bend');
        $bend.init({
          appKey: this.APP_KEY,
          appSecret: this.APP_SECRET
        }).then(function () {
          angular.bootstrap(document.getElementById('app'), ['themesApp'])
        });
      };

      BendAuth.checkAuth = function () {
        if (!this.isLoggedIn()) {
          return this.redirectToLogin();
        } else {
          var user = this.getActiveUser();

          $rootScope.globals.admin =  {
            name: (_.isUndefined(user.fullName)) ? user.username : user.fullName,
            id: user._id,
            avatarUrl: "/assets/img/avatarPlaceholder.png"
          };

          if(angular.isDefined(user.avatar)) {
            $bend.File.find(new $bend.Query().equalTo("_id",user.avatar._id)).then(function(res){
              if(res.length>0) {
                $rootScope.globals.admin.avatarUrl=_.first(res)._downloadURL;
              }
            });
          }

          var isAdmin = localStorage.getItem("isAdmin");
          //console.log("isAdmin", isAdmin);
          if(isAdmin == '1') {
            this.isAdmin(user,function(admin){
              if(!admin) {
                BendAuth.logOut();
                return;
              }

              $rootScope.globals.isAdmin = true;
            });
          } else {
            if(user.orgCode && user.isOrgAdmin) {
              $rootScope.globals.isAdmin = false;
            } else {
              BendAuth.logOut();
            }
          }
        }
      };

      BendAuth.getActiveUser = function () {
        return $bend.getActiveUser();
      };

      BendAuth.init = function () {
        return $bend.init({
          appKey: BendAuth.APP_KEY,
          appSecret: BendAuth.APP_SECRET
        });
      };

      BendAuth.isLoggedIn = function () {
        return $bend.getActiveUser() != null;
      };

      BendAuth.checkEmail = function (username, callback) {
        console.log(username);
        $bend.User.exists(username).then(function(ret){
          console.log(ret);
          if(ret) {
            callback(true);
          } else {
            callback(false);
          }
        }, function(err){
          console.log(err);
        })
      };

      BendAuth.isExpired = function() {
        var activeUser = BendAuth.getActiveUser();
        var now = new Date().getTime() * 1000000;
        if(activeUser.subscriptionType == 0 || activeUser.subscriptionType == 1 || activeUser.subscriptionType == 6 ) {
          /*if(activeUser.expirationDateFreeTrial) {
            if(activeUser.expirationDateFreeTrial < now) {
              return true;
            }
          } else {
            return true;
          }*/
          if(activeUser.expirationDate) {
            if(activeUser.expirationDate < now) {
              return true;
            }
          } else {
            return true;
          }
        } else if(activeUser.subscriptionType == 2 || activeUser.subscriptionType == 3 || activeUser.subscriptionType == 4 ) {
          if(activeUser.expirationDate) {
            if(activeUser.expirationDate < now) {
              return true;
            }
          } else {
            return true;
          }
        }

        return false;
      }

      BendAuth.logIn = function (loginData, callback) {
        var callback = callback || function () {};
        var credentials = {
          username:loginData.username,
          password:loginData.password,
        }
        $bend.User.login(credentials).then(
          function (res) {
            if(loginData.orgCode && loginData.orgCode != "") {
              if(loginData.orgCode == res.orgCode && res.isOrgAdmin) {
                $rootScope.globals.isAdmin = false;
                localStorage.setItem("isAdmin", "0");
                callback(null);
              } else {
                callback({
                  name: "Organization code is not correct."
                });
                BendAuth.logOut();
              }
            } else {
              BendAuth.isAdmin(res, function (isAdmin) {
                if(isAdmin) {
                  callback(null);
                  localStorage.setItem("isAdmin", "1");
                  $rootScope.globals.isAdmin = true;
                }
                else {
                  //check organization admin
                  callback({
                    name: "Privilege is not sufficient."
                  });
                  BendAuth.logOut();
                }
              });
            }
          },
          function (error) {
            callback({
              name: "The email address or password is incorrect."
            });
          }
        );
      };

      BendAuth.logOut = function () {
        if (this.isLoggedIn()) {
          return $bend.User.logout({
            success: function () {
              localStorage.removeItem("isAdmin");
              BendAuth.redirectToLogin();
              return $bend.Sync.destruct();
            }
          });
        }
      };

      BendAuth.redirectToDashboard = function () {
        {
          return $location.path('/');
        }
      };

      BendAuth.redirectToLogin = function () {
        if ($location.$$url == '/signup') {
          return $location.path('/signup');
        } else if ($location.$$url == '/agreement') {
          return $location.path('/agreement');
        } else if ($location.$$url !== '/signin') {
          return $location.path('/signin');
        }
      };

      BendAuth.isAdmin = function(user,callback) {
        var authString = "Bend " + user._bmd.authtoken;//res._bmd.authtoken;;
        $.ajax({
          url: BendAuth.URL + BendAuth.APP_KEY + "/" + BendAuth.GROUP_ID,
          //url: 'http://bend.neusis.com:8000/group/' + BendAuth.APP_KEY + "/" + BendAuth.GROUP_ID,
          //url: 'https://api.touchrounds.com/group/' + BendAuth.APP_KEY + "/" + BendAuth.GROUP_ID,
          headers: {"Authorization": authString}
        }).then(function(ret){
          var adminList = ret.users.list;
          var adminUser = _.find(adminList, function(o){
            return o._id == user._id;
          })

          if(adminUser) {
            $rootScope.globals.isAdmin = true;
            callback(true);
          }
          else {
            callback(false);
          }
        }, function(err){
          callback(false);
        });
      };

      BendAuth.setAdmin = function(user,isAdmin,callback) {
        var callback = callback || function() {};
      };

      return BendAuth;
    }
  ]);
