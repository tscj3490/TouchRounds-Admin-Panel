'use strict'

angular.module('app.controllers')
  .controller('TeamEditController', ['$scope','$bend','$location', '$routeParams', 'BendAuth', 'BendService', 'CommonUtil', '$bootbox','$rootScope','$modal','pinesNotifications',
    function ($scope,$bend,$location, $routeParams, BendAuth, BendService, CommonUtil, $bootbox, $rootScope, $modal, pinesNotifications) {

      // Init.
      $scope.members = [];
      $scope.admins = [];
      $scope.invitations = [];
      $scope.isLoading=true;
      $scope.team = {};
      $scope.CommonUtil = CommonUtil;
      $scope.isAdmin = false;
      $scope.showLeaveButton = false;
      $scope.isOutpatient = false;

      var serviceId = $routeParams.id;

      $scope.collectionView ={
        searchTerm: "",
        isLoading: true,
      };

      $scope.loadMembers = function(searchTerm) {
        $scope.isLoading=true;

        function query(str) {
          var query=new $bend.Query();
          if(serviceId != null && serviceId != '')
            query.equalTo('serviceId', serviceId);
          return query;
        }

        var q = query(searchTerm);

        $bend.DataStore.find("service_user", q,{
        }).then(function(serviceUsers){
          var userIds = [];
          var adminIds = [];
          var user = BendAuth.getActiveUser();

          serviceUsers.map(function(serviceUser, index) {
            userIds.push(serviceUser.userId);

            if(serviceUser.isAdmin) {
              if(user._id == serviceUser.userId)
                $scope.isAdmin = true;
              adminIds.push(serviceUser.userId);
            }
          });

          if(userIds.length == 0) {
            $scope.members=[];
            $scope.isLoading = false;
          } else {
            q = new $bend.Query().contains('_id', userIds);
            $bend.User.find(q, {
            }).then(function(members) {
              console.log(members);
              if(members) {
                members.map(function(member, index) {
                  if(_.indexOf(adminIds, member._id) != -1) {
                    member.isAdmin = true;
                    $scope.admins.push(member);
                  } else {
                    $scope.showLeaveButton = true;
                    member.isAdmin = false;
                    $scope.members.push(member);
                  }
                });
              }

              $scope.isLoading = false;
            }, function(err) {
              console.log(err);
              $scope.isLoading = false;
            });
          }
        },function(err){
          console.log(err);
          $scope.isLoading = false;
        });
      };

      $scope.loadInvitations = function(searchTerm) {

        var q=new $bend.Query();
        if(serviceId != null && serviceId != '')
          q.equalTo('serviceId', serviceId);

        $bend.DataStore.find("service_invitation", q,{
        }).then(function(results){
          $scope.invitations = results;
        },function(err){
          console.log(err);
        });
      };

      $scope.loadMembers("");
      $scope.loadInvitations("");

      $bend.DataStore.get("service", serviceId).then(function(service) {
        $scope.team = service;
        if(service != null && service != 'undefined') {
          $scope.isOutpatient = service.isOutpatient;
          $scope.mayInvite = service.colleaguesMayInvite;
        }
      });

      $scope.onSearch = function() {
        console.log("On search!");
        $scope.loadMembers($scope.collectionView.searchTerm);
        // FIXME: Should update current query string.
      };

      $scope.onPageChange = function() {
        $scope.loadPatients($scope.collectionView.searchTerm);
        // FIXME: Should update current query string.
      };

      $scope.selectMember = function(member) {
        //$location.path("/members/edit/"+member._id);
      };

      $scope.addNewMember = function() {
        $location.path("/members/edit");
      };

      $scope.getRoleName = function(role) {
        switch (role) {
          case 0:return "Attending";
          case 1:return "Fellow";
          case 2:return "Nurse";
          case 3:return "Nurse Practitioner";
          case 4:return "Physicans Assistant";
          case 5:return "Resident";
          case 6:return "Student";
          default:return "Attending";
        }
      }

      $scope.deleteService = function() {
        var msg = "Deleting the team is permanent and can not be undone. All patients and tasks will be deleted.";
        $bootbox.confirm(msg, function(result) {
          if(result) {
            $bend.execute("delete-service", {serviceId:serviceId}).then(function(ret){
              console.log(ret);
              return $location.path('/teams');
            }, function(err){
              console.log(err);
            });
          }
        });
      }

      $scope.deleteMember = function(member) {
        var msg = "Are you sure?";
        $bootbox.confirm(msg, function(result) {
          if(result) {
            $bend.execute("delete-member", {
              param:{
                serviceId:serviceId,
                userId:member._id
              }
            }).then(function(ret){
              console.log(ret);
              for(var i = 0 ; i < $scope.members.length ; i++) {
                if($scope.members[i]._id == member._id) {
                  $scope.members.splice(i, 1);return;
                }
              }
            }, function(err){
              console.log(err);
            });
          }
        });
      }

      $scope.changeTeamName = function() {
        $bend.execute("update-service", {serviceData:$scope.team}).then(function(ret){
          console.log(ret);
          var oNotify = pinesNotifications.notify({
            text: 'Successfully updated',
            type: 'info'
          });

          setTimeout(function(){
            oNotify.remove();
          }, 2000);
        }, function(err){
          console.log(err);
        })
      }

      $scope.setMayInvite = function() {
        $scope.mayInvite = !$scope.mayInvite;
        $scope.team.colleaguesMayInvite = $scope.mayInvite;

        //update service
        $bend.execute("update-service", {serviceData:$scope.team}).then(function(ret){
          console.log(ret);
          var oNotify = pinesNotifications.notify({
            text: 'Successfully updated',
            type: 'info'
          });

          setTimeout(function(){
            oNotify.remove();
          }, 2000);
        }, function(err){
          console.log(err);
        })
      }

      $scope.setOutPatient = function() {
        $scope.isOutpatient = !$scope.isOutpatient;
        $scope.team.isOutpatient = $scope.isOutpatient;

        $bend.execute("update-service", {serviceData:$scope.team}).then(function(ret){
          var oNotify = pinesNotifications.notify({
            text: 'Successfully updated',
            type: 'info'
          });

          setTimeout(function(){
            oNotify.remove();
          }, 2000);
        }, function(err){
          console.log(err);
        })
      }

      $scope.cancelInvite = function(member){
        BendService.cancelInvite(member, function(ret) {
          for(var i = 0 ; i < $scope.invitations.length ; i++) {
            if($scope.invitations[i].userEmail == member.userEmail) {
              $scope.invitations.splice(i, 1);
              return;
            }
          }
        });
      }

      $scope.invite = function() {
        var modalInstance = $modal.open({
          templateUrl: 'inviteForm.html',
          controller: function ($scope, $modalInstance, service, invitations) {
            $scope.form = {};
            $scope.team = service;
            $scope.invitations = invitations;

            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.close = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.inviteDo = function () {
              $bend.execute("service-invitation", {serviceId:$scope.team._id, userEmail:$scope.form.email}).then(function(ret){
                $scope.invitations.push(ret);
                BendService.inviteUser($scope.team, $scope.form.email, function(err, ret) {
                  console.log(err, ret);
                  $modalInstance.dismiss('cancel');
                });
              }, function(err){
                console.log(err);
                return;
              })
            };
            $scope.canSubmitValidationForm = function() {
              return $scope.form.validateForm.$valid;
            };
          },
          resolve: {
            service: function () {
              return $scope.team;
            },

            invitations:function () {
              return $scope.invitations;
            },
          }
        });
      }

      $scope.$on("search-patient", function(evt, arg){
        console.log("search-patient", arg);
        $location.url("/services/" + serviceId + "/patients?query=" + arg);
      })

      $scope.$on("invite_accept", function(evt, arg){
        console.log("invite_accept", arg);
        if($scope.team._id == arg.serviceId) {
          //remove from invite list
          var invite = _.find($scope.invitations, function(o){
            return o.userEmail == arg.user.username;
          })
          if(invite) {
            var idx = $scope.invitations.indexOf(invite);
            $scope.invitations.splice(idx, 1);
          }

          //add to memberList
          var u = _.find($scope.members, function(o){
            return o._id == arg.user._id;
          })

          if(!u) {
            $scope.members.push(arg.user);
          }
        }
      })

      $scope.$on("invite_reject", function(evt, arg){
        console.log("invite_reject", arg);
        if($scope.team._id == arg.serviceId) {
          //remove from invite list
          var invite = _.find($scope.invitations, function (o) {
            return o.userEmail == arg.userEmail;
          })
          if (invite) {
            var idx = $scope.invitations.indexOf(invite);
            applyChangesOnScope($scope, function(){
              $scope.invitations.splice(idx, 1);
            })
          }
        }
      });

      $scope.openLeaveService = function() {
        var modalInstance = $modal.open({
          templateUrl: 'selectAdmin.html',
          controller: function ($scope, $modalInstance, members, service) {
            $scope.form = {};
            $scope.members = members;
            $scope.team = service;
            if($scope.members) {
              $scope.form.member = $scope.members[0];
            }
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.close = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.leaveServiceDo = function () {
              console.log('leaveServiceDo');
              //leave service
              BendService.leaveService($scope.team, $scope.form.member, function(ret) {
                $rootScope.$broadcast("service_deleted", $scope.team);
                $modalInstance.dismiss('cancel');
                return $location.path('/patients');
              });
            };
            $scope.getFullName = function(member){
              return member.firstName + " " + member.lastName;
            }
          },
          resolve: {
            members: function () {
              return $scope.members;
            },
            service: function () {
              return $scope.team;
            },
          }
        });
      };
    }]);
