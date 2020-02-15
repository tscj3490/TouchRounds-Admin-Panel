'use strict'

angular.module('app.controllers')
  .controller('TeamController', ['$scope','$bend','$location','$routeParams', 'BendAuth', 'BendService', 'CommonUtil', '$bootbox','$rootScope','$modal', '$cookieStore',
    function ($scope,$bend,$location, $routeParams, BendAuth, BendService, CommonUtil, $bootbox, $rootScope, $modal, $cookieStore) {

      // Init.
      $scope.teamList = [];
      $scope.isLoading=true;
      $scope.CommonUtil = CommonUtil;

      $scope.collectionView ={
        searchTerm: $rootScope.globals.userSearchFilter.searchTerm,
        itemsPerPage:20,
        isLoading: true,
        totalItems: 0,
        currentPage: 1,
        numPages: 0
      };

      $scope.currentUser = BendAuth.getActiveUser();
      var orgUsers = [];
      var serviceIdList = [];
      $scope.serviceUserMap = [];
      $scope.sortDir = [0,0,0,0,0, 0]

      BendService.getOrganizationUsers($scope.currentUser.orgCode, function(err, users){
        orgUsers = users;
        async.map(orgUsers, function(o, callback){
          var query = new $bend.Query();
          query.equalTo("userId", o._id);
          $bend.DataStore.find("service_user", query).then(function(rets){
            _.map(rets, function(o){
              serviceIdList.push(o.serviceId);
            });
            callback(null, null);
          }, function(err){
            callback(err, null);
          });
        }, function(err, rets){
          if(err) {
            console.log(err);
            return;
          }

          serviceIdList = _.uniq(serviceIdList);
          $scope.loadTeams();
        })
      })

      $scope.sortColumn = function(idx, e) {
        e.stopPropagation();
        e.preventDefault();
        _.map($scope.sortDir, function(item, i){
          if(idx == i) {
            $scope.sortDir[i] = ($scope.sortDir[idx]==0?1:$scope.sortDir[idx] * (-1));
          } else {
            $scope.sortDir[i] = 0
          }
        })

        switch (idx) {
          case 0:
            $scope.teamList = _.sortBy($scope.teamList, function(ret){
              return ret.serviceName.toUpperCase();
            });
            break;
          case 1:
            $scope.teamList = _.sortBy($scope.teamList, function(ret){
              return ret.isOutpatient
            });
            break;
          case 2:
            $scope.teamList = _.sortBy($scope.teamList, function(ret){
              var d = ret.isDischargeService?1:0;
              return d
            });
            break;
          case 3:
            $scope.teamList = _.sortBy($scope.teamList, function(ret){
              return ret.patientsCount
            });
            break;
          case 4:
            $scope.teamList = _.sortBy($scope.teamList, function(ret){
              var name = ret.adminName?ret.adminName:"";
              return name.toUpperCase();
            });
            break;
          case 5:
            $scope.teamList = _.sortBy($scope.teamList, function(ret){
              return ret.isOrgService?1:0
            });
            break;
        }

        if($scope.sortDir[idx] == -1) {
          $scope.teamList = $scope.teamList.reverse();
        }
      }

      $scope.loadServiceAdmin = function() {
        var query=new $bend.Query();
        query.contains("serviceId", serviceIdList);
        query.equalTo("isAdmin", true);
        $bend.DataStore.find("service_user", query).then(function(rets){
          var serviceUsers = []
          var userIds = []
          _.map(rets, function(o){
            serviceUsers.push({
              userId:o.userId,
              serviceId:o.serviceId
            });
            userIds.push(o.userId)
          })

          //console.log("service_user", rets, userIds);

          userIds = _.uniq(userIds);

          query=new $bend.Query();
          query.contains("_id", userIds);
          $bend.User.find(query).then(function(rets){
            //console.log("users", rets);
            _.map(rets, function(user){
              var selectedList = _.filter(serviceUsers, function(_o){
                return _o.userId == user._id
              })

              selectedList.map(function(o){
                var ret = _.find($scope.teamList, function(o2){
                  return o2._id == o.serviceId;
                })
                if(ret) {
                  ret.adminName = CommonUtil.getFullName(user);
                }
              })
            })
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        })
      }

      $scope.loadTeams = function() {
        $scope.isLoading=true;

        function query(str) {
          var query=new $bend.Query();
          if(str==="") return query;
          var q2 = new $bend.Query().matches("serviceName",str,{
              ignoreCase: true
            });
          return query.and(q2);
        }

        var q = query($scope.collectionView.searchTerm);
        q.notEqualTo("deleted", true);

        q.limit($scope.collectionView.itemsPerPage);
        q.skip(($scope.collectionView.currentPage-1)*$scope.collectionView.itemsPerPage);
        q.contains("_id", serviceIdList);

        $bend.DataStore.find("service", q).then(function(rets) {
          $scope.teamList = rets;
          $scope.isLoading = false;
          $scope.loadServiceAdmin();
          //get users count, patients count
          $scope.teamList.map(function(o){
            o.patientsCount = 0;
            var q = new $bend.Query();
            q.notEqualTo("deleted", true);
            q.equalTo("serviceId", o._id);
            $bend.DataStore.count("patient", q).then(function(count){
              o.patientsCount = count;
            },function(err){
              console.log(err);
            });
          });
        }, function(error) {
          console.log(error);
        });

        $bend.DataStore.count("service", q).then(function(count){
          applyChangesOnScope($scope, function(){
            $scope.collectionView.totalItems=count;
            $scope.collectionView.numPages=$scope.collectionView.totalItems/$scope.collectionView.itemsPerPage+1;
          });
        },function(err){
          console.log(err);
        });
      };

      $scope.onSearch = function() {
        console.log("On search!");
        $scope.loadTeams();
      };

      $scope.onPageChange = function() {
        $scope.loadTeams();
      };

      $scope.editTeam = function(team) {
        return $location.path("/teams/edit/" + team._id);
      }

      $scope.updateTeam = function(item) {
        var _u = _.clone(item);
        delete _u.$$hashKey;
        $bend.execute("update-service", {serviceData:_u}).then(function(ret){
          console.log(ret);
        }, function(err){
          console.log(err);
        });
      }

      $scope.toggleOutpatient = function(item, e) {
        e.stopPropagation();
        e.preventDefault();
        item.isOutpatient = !item.isOutpatient;
        var _u = _.clone(item);
        delete _u.$$hashKey;
        $bend.execute("update-service", {serviceData:_u}).then(function(ret){
          console.log(ret);
        }, function(err){
          console.log(err);
        });
      }

      $scope.toggleOrgService = function(item, e) {
        e.stopPropagation();
        e.preventDefault();
        item.isOrgService = !item.isOrgService;
        var _u = _.clone(item);
        delete _u.$$hashKey;
        $bend.execute("update-service", {serviceData:_u}).then(function(ret){
          if(item.isOrgService) {
            //need to include all organization users in this service
            $bend.execute("update-service-to-enterprise", {
              orgCode:$scope.currentUser.orgCode,
              userId:$scope.currentUser._id,
              serviceId:item._id
            }).then(function(ret){
              console.log(ret);
            }, function(err){
              console.log(err);
            })
          }
          console.log(ret);
        }, function(err){
          console.log(err);
        });
      }

      $scope.toggleDischarge = function(item, e) {
        e.stopPropagation();
        e.preventDefault();
        item.isDischargeService = !item.isDischargeService;
        var _u = _.clone(item);
        delete _u.$$hashKey;
        $bend.execute("update-service", {serviceData:_u}).then(function(ret){
          console.log(ret);
        }, function(err){
          console.log(err);
        });
      }

      $scope.deleteTeam = function(item, e){
        e.stopPropagation();
        e.preventDefault();

        var msg = "Deleting the team is permanent and can not be undone. All patients and tasks will be deleted.";
        $bootbox.confirm(msg, function(result) {
          if(result) {
            $bend.execute("delete-service", {serviceId:item._id}).then(function(ret){
              var idx = $scope.teamList.indexOf(item);
              $scope.teamList.splice(idx, 1);
              $scope.collectionView.totalItems--;
            }, function(err){
              console.log(err);
            });
          }
        });
      }

      $rootScope.addTeam = function(item){
        $scope.teamList.push(item);
        $scope.collectionView.totalItems++;
      }

      $scope.createTeam = function() {
        var modalInstance = $modal.open({
          templateUrl: 'createService.html',
          controller: function ($scope, $modalInstance) {
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.close = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.createServiceDo = function () {
              $bend.execute("create-service", {
                serviceData:{
                  serviceName:$scope.serviceName,
                  colleaguesMayInvite:$scope.colleaguesMayInvite,
                  isOutpatient:$scope.isOutpatient,
                  isOrgService:true
                },
                orgCode:$bend.getActiveUser().orgCode,
                userId:$bend.getActiveUser()._id
              }).then(function(ret){
                console.log(ret);
                ret.result.adminName = CommonUtil.getFullName($bend.getActiveUser())
                ret.result.patientsCount = 0;
                $rootScope.addTeam(ret.result);
                $modalInstance.dismiss('cancel');
              }, function(err){
                console.log(err);
              })
            };
            $scope.canSubmitValidationForm = function() {
              return $scope.form.validateForm.$valid;
            };
          },
          size: 'lg',
        });
      };

      $scope.consolidate = function() {
        var orgDischarged = null;
        var dischargedList = _.filter($scope.teamList, function(o){
          if(o.isDischargeService && o.isOrgService) {
            orgDischarged = o;
          }
          return o.isDischargeService
        })
        console.log(orgDischarged);
        if(orgDischarged == null) {
          //create new org discharged service
          $bend.execute("create-service", {
            serviceData:{
              serviceName:'Discharged service',
              isOrgService:true,
              isDischargeService:true
            },
            orgCode:$bend.getActiveUser().orgCode,
            userId:$bend.getActiveUser()._id
          }).then(function(ret){
            $bend.execute("consolidate-discharge", {
              from:CommonUtil.getIdList(dischargedList),
              to:ret.result._id
            }).then(function(ret2){
              console.log(ret, ret2);
              ret.result.adminName = CommonUtil.getFullName($bend.getActiveUser())
              ret.result.patientsCount = ret2.count
              $scope.teamList.push(ret.result);
              dischargedList.map(function(o){
                var idx = $scope.teamList.indexOf(o);
                $scope.teamList.splice(idx, 1);
              })
            }, function(err){
              console.log(err);
            })

          }, function(err){
            console.log(err);
          })
        } else {
          var idx = dischargedList.indexOf(orgDischarged);
          dischargedList.splice(idx, 1);
          $bend.execute("consolidate-discharge", {
            from:CommonUtil.getIdList(dischargedList),
            to:orgDischarged._id
          }).then(function(ret2){
            orgDischarged.patientsCount += ret2.count
            dischargedList.map(function(o){
              var idx = $scope.teamList.indexOf(o);
              $scope.teamList.splice(idx, 1);
            })
          }, function(err){
            console.log(err);
          })
        }
      }
    }]);



