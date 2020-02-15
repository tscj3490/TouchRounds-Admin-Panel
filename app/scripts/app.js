angular
  .module('themesApp', [
    'theme',
    'theme.core.services',
    'theme.chart.flot',
    'oc.lazyLoad',
    /*'theme.demos',*/
    'LocalStorageModule',
    'theme.core.directives',
    'bend',
    'app.common',
    'app.auth',
    'app.pusher',
    'app.directives',
    'app.model',
    'app.service',
    'app.services',
    'ui.bootstrap.datetimepicker',
    'base64',
    /*'monospaced.elastic',*/
    'ngCookies',
    'ui.select2',
    /*'minicolors',*/
    'app.controllers',
  ])
  .config(['$provide', '$routeProvider', 'localStorageServiceProvider', '$sceDelegateProvider', function($provide, $routeProvider,  localStorageServiceProvider, $sceDelegateProvider) {
    'use strict';
    localStorageServiceProvider.setPrefix('TouchRoundsAdmin');
    $sceDelegateProvider.resourceUrlWhitelist(['**']);
    $routeProvider
      .when('/', {
        templateUrl: 'views/index.html',
        resolve: {
          loadCalendar: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load([
              'bower_components/fullcalendar/fullcalendar.js'
            ]);
          }]
        }
      })
      .when('/users', {
        templateUrl: function(param) {
          return 'views/Users/users.html';
        }
      })
      .when('/users/create', {
        templateUrl: function(param) {
          return 'views/Users/userEdit.html';
        }
      })
      .when('/users/edit/:id', {
        templateUrl: function(param) {
          return 'views/Users/userEdit.html';
        }
      })
      .when('/teams', {
        templateUrl: function(param) {
          return 'views/teams/teams.html';
        }
      })
      .when('/teams/edit/:id', {
        templateUrl: function(param) {
          return 'views/teams/teamEdit.html';
        }
      })
      .when('/organizations', {
        templateUrl: function(param) {
          return 'views/org/organizations.html';
        }
      })
      .when('/organizations/create', {
        templateUrl: function(param) {
          return 'views/org/organizationEdit.html';
        }
      })
      .when('/organizations/edit/:id', {
        templateUrl: function(param) {
          return 'views/org/organizationEdit.html';
        }
      })
      .when('/signin', {
        templateUrl: function(param) {
          return 'views/signin.html';
        }
      })
      .when('#', {
        templateUrl: 'views/index.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .run(['$rootScope', 'BendAuth','BendPusher', 'pinesNotifications', '$bend', '$cookieStore','$cookies', function ($rootScope, BendAuth, BendPusher, pinesNotifications, $bend, $cookieStore, $cookies) {
    console.log("initialize");
    // Init globals.
    $rootScope.globals = {
      userSearchFilter :{
        searchTerm:"",
        searchRole:"",
        searchPlan:"",
        customQuery:"",
        sortFlag:[false, false, false, false, false, false, false],
      },
      isAdmin:false
    };
    $rootScope.logoutNotify = null;

    if (!$rootScope.itemsPerPage){
      var saved=parseInt($cookies.itemsPerPage);
      $rootScope.itemsPerPage=saved ? saved : 20;
    }
    $rootScope.setItemsPerPage=function(val){
      if (val){
        val=parseInt(val);
        $cookies.itemsPerPage=val;
        $rootScope.itemsPerPage=val;
      }
    };

    // Start auth check workflow.
    BendAuth.checkAuth();
    if(BendAuth.isLoggedIn()) {
      BendPusher.init();
      var stateObj = $cookieStore.get(BendAuth.getActiveUser()._id + "_state");
      console.log("cookie data", BendAuth.getActiveUser()._id, stateObj);
      if(stateObj)
        $rootScope.globals.state = stateObj;
    }

    setInterval(function () {
      var now = Date.now();

      if(BendAuth.isLoggedIn())
        $bend.LocalStorage.save('tokenLastUsedTime', now.valueOf());
    }, 1000 * 60);
  }]);

(function () {
  var initInjector = angular.injector(['ng','bend', 'app.auth','app.service']);
  var BendAuthBootstrap = initInjector.get('BendAuthBootstrap');
  BendAuthBootstrap.bootstrapService();
})();
