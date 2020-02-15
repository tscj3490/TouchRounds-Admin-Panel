'use strict'

angular.module('app.controllers')
  .controller('OrgEditController', ['$scope','$bend','$location','$routeParams', 'BendAuth', 'BendService', 'CommonUtil', '$bootbox','$rootScope','$modal','$http','pinesNotifications',
    function ($scope,$bend,$location, $routeParams, BendAuth, BendService, CommonUtil, $bootbox, $rootScope, $modal, $http, pinesNotifications) {
      $scope.isLoading=true;
      $scope.orgId = $routeParams.id;
      $scope.org = {};
      $scope.users = [];

      $scope.CommonUtil = CommonUtil;
      $scope.formData = {
        expirationDate:""
      }

      BendService.getOrganizationById($scope.orgId, function(err, ret){
        if(err) {
          console.log(err);
          $scope.isLoading = false;
          return;
        }

        $scope.org = ret;
        if(!$scope.org.usersCount)
          $scope.org.usersCount = 0;
        if(!$scope.org.slotsCount)
          $scope.org.slotsCount = 0;

        if (ret.expirationDate)
          $scope.formData.expirationDate = CommonUtil.formatDate(ret.expirationDate);

        //fetch users
        BendService.getOrganizationUsers(ret.code, function(err, rets){
          if(err) {
            console.log(err);
            $scope.isLoading = false;
            return;
          }

          $scope.users = _.sortBy(rets, function(o){
            return CommonUtil.getFullName(o).toUpperCase()
          });
          $scope.isLoading = false;
        })
      })

      $scope.updateUsers = function(e) {
        e.preventDefault();
        e.stopPropagation();

        if(typeof $scope.formData.expirationDate == "object") {
          $scope.org.expirationDate = $scope.formData.expirationDate.getTime() * 1000000;
        }

        async.map($scope.users, function(o, callback){
          o.expirationDate = $scope.org.expirationDate;
          o.subscriptionType = 5; //"Enterprise Subscription"
          BendService.updateUser(o, function(ret){
            console.log(ret);
            callback(null, null);
          })
        }, function(err, ret){
          console.log(err, ret);

          if(!err) {
            var oNotify = pinesNotifications.notify({
              text: 'Successfully updated',
              type: 'info'
            });

            setTimeout(function(){
              oNotify.remove();
            }, 2000);
          }
        })
      }

      $scope.showUserDetail = function(u) {
        $location.path("/users/edit/" + u._id);
      }

      $scope.save = function(e) {
        e.preventDefault();
        e.stopPropagation();

        if($scope.org.slotsCount < $scope.users.length) {
          $bootbox.alert("The slots count couldn't less than the count of users.")
          return;
        }

        $scope.org.usersCount = $scope.users.length;

        if(typeof $scope.formData.expirationDate == "object") {
          $scope.org.expirationDate = $scope.formData.expirationDate.getTime() * 1000000;
        }

        BendService.updateOrganization($scope.org, function(err, ret){
          if(err) {
            console.log(err);
            return;
          }

          var oNotify = pinesNotifications.notify({
            text: 'Successfully updated',
            type: 'info'
          });

          setTimeout(function(){
            oNotify.remove();
          }, 2000);

          if(changedExpiration) {
            async.map($scope.users, function(o, callback){
              o.expirationDate = $scope.org.expirationDate;
              o.subscriptionType = 5; //"Enterprise Subscription"
              BendService.updateUser(o, function(ret){
                console.log(ret);
                callback(null, null);
              })
            }, function(err, ret){
              console.log(err, ret);
            })
          }
        })
      }

      $scope.openDateWindow = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedDateSelector = true;
      };

      $rootScope.addUserDo = function(user) {
        delete user.$$hashKey;
        BendService.addOrganizationUser(user, $scope.org, false, function(err, ret){
          if(err) {
            console.log(err);
            return;
          }

          $scope.users.push(ret);
        });
      }

      $scope.deleteUser = function(user) {
        var _u = _.clone(user);
        delete _u.$$hashKey;
        BendService.deleteOrganizationUser(_u, $scope.org, function(err, ret){
          console.log(err, ret);
          if(!err) {
            var idx = $scope.users.indexOf(user);
            $scope.users.splice(idx, 1);
          }
        })
      }

      $scope.toggleAdmin = function(user) {
        user.isOrgAdmin = !user.isOrgAdmin;
        var _u = _.clone(user);
        delete _u.$$hashKey;
        BendService.setOrganizationUserAsAdmin(_u, user.isOrgAdmin, function(err, ret){
          console.log(err, ret);
        })
      }

      $scope.deleteOrganization = function(){
        BendService.deleteOrganization($scope.org, $scope.users, function(err, ret){
          $bootbox.alert("Organization has deleted.");
          $location.url("/organizations");
        })
      }

      $scope.addUser = function() {
        var modalInstance = $modal.open({
          templateUrl: 'selectUser.html',
          controller: function ($scope, $modalInstance) {
            $scope.userList = [];
            $scope.searchText = "";
            $scope.CommonUtil = CommonUtil;
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.close = function () {
              $modalInstance.dismiss('cancel');
            };

            $scope.onSearch = function() {
              if($scope.searchText == "")
                return;

              var query = new $bend.Query();
              query.exists("orgCode", false);

              query.and(new $bend.Query().matches("username",$scope.searchText,{
                  ignoreCase: true
                })
                .or(new $bend.Query().matches("firstName",$scope.searchText,{
                  ignoreCase: true
                }))
                .or(new $bend.Query().matches("lastName",$scope.searchText,{
                  ignoreCase: true
                })));

              $bend.User.find(query).then(function(users) {
                $scope.userList = users;
              }, function(error) {
                console.log(error);
              });
            }
            $scope.selectUser = function (user) {
              $rootScope.addUserDo(user);
              $modalInstance.dismiss('cancel');
            };
            $scope.canSubmitValidationForm = function() {
              return $scope.form.validateForm.$valid;
            };
          },
          size:"lg"
        });
      }
    }]);
