'use strict'

angular.module('app.controllers')
  .controller('SigninController', ['$scope','$location', '$theme', 'BendAuth','BendService', '$bend','$rootScope','$base64','rememberMeService',
    function($scope,$location, $theme, BendAuth, BendService, $bend, $rootScope, $base64, rememberMeService) {

      $scope.hasError=false;
      $scope.errorMessage="";
      $scope.invaildCredential = false;

      $theme.set('fullscreen', true);
      $scope.$on('$destroy', function () {
        $theme.set('fullscreen', false);
      });

      // If already signed in - redirect to main page.
      if(BendAuth.isLoggedIn()) {
        $theme.set('fullscreen', false);
        //$rootScope.initMenu();
        BendAuth.redirectToDashboard();
        return;
      }

      $scope.user = {
        orgCode: "",
        username: "",
        password: ""
      };

      $scope.errorMsg = "";

      $scope.submitForm = function() {

        BendAuth.logIn($scope.user,function(error){
          if(error) {
            console.log("Error While logging in!");
            console.log(error);

            $scope.hasError=true;
            $scope.errorMessage=error.name;

            $bend.User.logout({
              success: function () {
                return $bend.Sync.destruct();
              }
            });

            return;
          }

          BendService.init();
          $rootScope.$broadcast("login_initialize");
          //$rootScope.initMenu();
          console.log("login User=", BendAuth.getActiveUser());
          var savedURL = rememberMeService(BendAuth.getActiveUser()._id);
          console.log("savedURL=", savedURL);
          if(savedURL != null && savedURL != "") {
            $location.path(savedURL);
          } else
            BendAuth.redirectToDashboard();
        });
      };
    }]);
