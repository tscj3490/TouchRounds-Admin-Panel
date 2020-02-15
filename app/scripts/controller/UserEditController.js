'use strict'

angular.module('app.controllers')
  .controller('UserDetailController', ['$scope','$bend','$location','$routeParams', 'BendAuth', 'BendService', 'CommonUtil', '$bootbox','$rootScope','$modal','$http','pinesNotifications',
    function ($scope,$bend,$location, $routeParams, BendAuth, BendService, CommonUtil, $bootbox, $rootScope, $modal, $http, pinesNotifications) {
      $scope.isNew = true;
      $scope.isLoading=true;
      $scope.userId = $routeParams.id;
      $scope.currentUser = BendAuth.getActiveUser();

      $scope.isAdmin = false;
      var isAdminOld = false;
      $scope.data = {
        teamsCount : 0,
        patientsCount : 0,
        tasksCount : 0,
        notesCount : 0
      }

      if($scope.userId) {
        $scope.isNew = false;
      }
      $scope.CommonUtil = CommonUtil;
      $scope.openedDateSelector = [false];
      $scope.formData = {}

      if($scope.isNew) {
        $scope.user = {};
        $scope.isLoading = false;
        $scope.user.subscriptionType = 0;
        $scope.user.role = 0;
        $scope.formData.expirationDate = CommonUtil.formatDate(Date.now() * 1000000 + 30 * 24 * 3600 * 1000000000);
      } else {
        BendService.getUser($scope.userId, function (ret) {
          //console.log("user", ret);
          $scope.user = ret;

          if (ret.expirationDate)
            $scope.formData.expirationDate = CommonUtil.formatDate(ret.expirationDate);

          $scope.isLoading = false;
          if (!$scope.user.subscriptionType)
            $scope.user.subscriptionType = 0;
          if (!$scope.user.role)
            $scope.user.role = 0;

          //check if user is admin
          var authString = "Bend " + BendAuth.getActiveUser()._bmd.authtoken;
          $.ajax({
            //url: "https://bend.amphetamobile.com/group/" + BendAuth.APP_KEY + "/" + BendAuth.GROUP_ID,
            url: BendAuth.URL + BendAuth.APP_KEY + "/" + BendAuth.GROUP_ID,
            headers: {"Authorization": authString}
          }).then(function (ret) {
            var adminList = ret.users.list;
            var adminUser = _.find(adminList, function (o) {
              return o._id == $scope.user._id;
            })

            console.log(ret, adminList, $scope.user, adminUser);

            if (adminUser) {
              applyChangesOnScope($scope, function () {
                $scope.isAdmin = true;
                isAdminOld = $scope.isAdmin;
              });
            }
          }, function (err) {
            console.log(err);
          });
        })

        //get teams, patients, tasks count
        var serviceIdList = [];
        var availableServiceIdList = [];
        var query2 = new $bend.Query();
        query2.notEqualTo("isDischargeService", true);

        $bend.DataStore.find("service", query2).then(function (services) {
          services.map(function (o) {
            serviceIdList.push(o._id);
          })

          var query = new $bend.Query();
          query.equalTo("userId", $scope.userId);
          $bend.DataStore.find("service_user", query).then(function (rets) {
            var serviceUserList = [];
            rets.map(function (o) {
              if (serviceIdList.indexOf(o.serviceId) != -1) {
                serviceUserList.push(o);
              }
            })
            $scope.data.teamsCount = serviceUserList.length;
            async.map(serviceUserList, function (serviceUser, callback) {
              var q = new $bend.Query();
              q.equalTo("serviceId", serviceUser.serviceId);
              async.parallel([
                function (callback2) {
                  $bend.DataStore.count("patient", q).then(function (cnt) {
                    $scope.data.patientsCount += cnt;
                    callback2(null, true);
                  });
                },
                function (callback2) {
                  $bend.DataStore.count("patient_task", q).then(function (cnt) {
                    $scope.data.tasksCount += cnt;
                    callback2(null, true);
                  });
                },
                function (callback2) {
                  $bend.DataStore.count("patient_note", q).then(function (cnt) {
                    $scope.data.notesCount += cnt;
                    callback2(null, true);
                  });
                },
              ], function (err, rets) {
                callback(err, rets);
              })
            }, function (err, rets) {
              console.log(err);
              if (!err) {
                console.log("finished to get teams, patients, tasks count");
              }
            })
          })
        });
      }
      $scope.saveUserDo = function () {
        if(typeof $scope.formData.expirationDate == "object") {
          $scope.user.expirationDate = $scope.formData.expirationDate.getTime() * 1000000;
        }

        //$scope.user.expirationDate = moment($scope.formData.expirationDate, "MMMM D, YYYY").toDate().getTime() * 1000000;

        $scope.user.subscriptionType = Number($scope.user.subscriptionType);
        $scope.user.role = Number($scope.user.role);

        if($scope.isNew) {
          BendService.createUser($scope.user, function(ret){
            $bootbox.alert("User created", function(){
              applyChangesOnScope($scope, function(){
                $location.path("/users");
              })
            });

            if($scope.isAdmin) {
              BendService.setUserAsAdmin(ret._id, true, function(ret){
              });
            }
          })
        } else {
          if($rootScope.globals.isAdmin) {
            BendService.updateUser($scope.user, function(ret){
              if($scope.isAdmin != isAdminOld) {
                BendService.setUserAsAdmin(ret._id, $scope.isAdmin, function(ret){
                  isAdminOld = $scope.isAdmin;
                });
              }
              var oNotify = pinesNotifications.notify({
                text: 'User updated',
                type: 'info'
              });

              setTimeout(function(){
                oNotify.remove();
              }, 3000);

              $scope.form.validateForm.$dirty = false;
            })
          } else {
            $bend.execute("update-user", {userData:$scope.user}).then(function(ret){
              console.log(ret);
              var oNotify = pinesNotifications.notify({
                text: 'User updated',
                type: 'info'
              });

              setTimeout(function(){
                oNotify.remove();
              }, 3000);

              $scope.form.validateForm.$dirty = false;
            }, function(err){
              console.log(err);
            })
          }
        }
      };

      $scope.deleteUser = function() {
        bootbox.dialog({
          message: "Deleting the user is permanent and can not be undone",
          title: "Custom title",
          onEscape: function() {},
          show: true,
          backdrop: true,
          closeButton: true,
          animate: true,
          className: "my-modal",
          buttons: {
            "Cancel": {
              className: "btn-default",
              callback: function() {}
            },
            "Delete": {
              className: "btn-delete-full",
              callback: function() {
                BendService.deleteUser($scope.userId, function(ret){
                  applyChangesOnScope($scope, function(){
                    $location.path('/users');
                  });
                })
              }
            }
          }
        });
        /*var msg = "Deleting the user is permanent and can not be undone";
        $bootbox.confirm(msg, function(result) {
          if(result) {
            BendService.deleteUser($scope.userId, function(ret){
              $location.path('/users');
            })
          }
        });*/
      }

      $scope.openDateWindow = function($event, idx) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedDateSelector[idx] = true;
      };

      $scope.removeUser = function() {
        $bend.execute("remove-user-from-organization", {userData:$scope.user}).then(function(ret){
          console.log(ret);
          $location.path("/users");
        }, function(err){
          console.log(err);
        })
      }

      $scope.changePassword = function() {
        var modalInstance = $modal.open({
          templateUrl: 'changePassword.html',
          backdrop: 'static',
          controller: function ($scope, $modalInstance, user) {
            $scope.user = {};

            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.close = function () {
              $modalInstance.dismiss('cancel');
            };

            $scope.changePasswordDo = function () {
              user.password = $scope.user.password;
              if($rootScope.globals.isAdmin) {
                BendService.updateUser(user, function(ret){
                  console.log(ret);
                  $modalInstance.dismiss('cancel');
                })
              } else {
                $bend.execute("update-user", {userData:user}).then(function(ret){
                  console.log(ret);
                  $modalInstance.dismiss('cancel');
                }, function(err){
                  console.log(err);
                })
              }
            };

            $scope.canSubmitValidationForm = function() {
              return $scope.form.validateForm.$valid;
            };
          },
          resolve: {
            user: function () {
              return $scope.user;
            },
          }
        });
      };
      $scope.extendDays = function() {
        var modalInstance = $modal.open({
          templateUrl: 'extendDays.html',
          backdrop: 'static',
          controller: function ($scope, $modalInstance) {
            $scope.extendDays = 30; //default
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.close = function () {
              $modalInstance.dismiss('cancel');
            };

            $scope.extendDo = function () {
              $modalInstance.close($scope.extendDays);
            };

            $scope.canSubmitValidationForm = function() {
              return $scope.form.validateForm.$valid;
            };
          },
          resolve: {

          }
        });
        modalInstance.result.then(function(extendDays) {
          if(typeof $scope.formData.expirationDate == "object") {
            $scope.user.expirationDate = $scope.formData.expirationDate.getTime() * 1000000;
          }

          if(!$scope.user.expirationDate) {
            $scope.user.expirationDate = date.now() * 1000000;
          }

          $scope.user.expirationDate += Number(extendDays) * 24 * 3600 * 1000000000;

          $scope.formData.expirationDate = CommonUtil.formatDate($scope.user.expirationDate);

          $scope.saveUserDo();
        }, function() {

        });
      };
    }]);
