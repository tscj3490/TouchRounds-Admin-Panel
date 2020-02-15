'use strict'

angular.module('app.controllers')
  .controller('UserController', ['$scope','$bend','$location','$routeParams', 'BendAuth', 'BendService', 'CommonUtil', '$bootbox','$rootScope','$modal', '$cookieStore',
    function ($scope,$bend,$location, $routeParams, BendAuth, BendService, CommonUtil, $bootbox, $rootScope, $modal, $cookieStore) {

      // Init.
      $scope.userList = [];
      $scope.isLoading=true;
      $scope.CommonUtil = CommonUtil;
      var savedPageNum = $cookieStore.get(BendAuth.getActiveUser()._id + "_pageNum");

      $scope.org = {};
      $scope.currentUser = BendAuth.getActiveUser();
      $scope.isOrgAdmin = $scope.currentUser.orgCode && $scope.currentUser.isOrgAdmin;
      if($scope.isOrgAdmin) {
        BendService.getOrganization($scope.currentUser.orgCode, function(err, ret){
          if(ret){
            $scope.org= ret;
          }
        })
      }

      $scope.collectionView ={
        searchTerm: $rootScope.globals.userSearchFilter.searchTerm,
        searchPlan: $rootScope.globals.userSearchFilter.searchPlan,
        searchRole: $rootScope.globals.userSearchFilter.searchRole,
        itemsPerPage:savedPageNum?savedPageNum:20,
        isLoading: true,
        totalItems: 0,
        currentPage: 1,
        numPages: 0
      };

      $scope.sortFlag = $rootScope.globals.userSearchFilter.sortFlag; //[false, false, false, false, true, false, false];//false - asc, true - desc

      $scope.loadUsers = function() {
        $rootScope.globals.userSearchFilter.searchTerm = $scope.collectionView.searchTerm;
        $rootScope.globals.userSearchFilter.searchRole = $scope.collectionView.searchRole;
        $rootScope.globals.userSearchFilter.searchPlan = $scope.collectionView.searchPlan;
        $rootScope.globals.userSearchFilter.sortFlag = $scope.sortFlag;

        console.log($rootScope.globals.userSearchFilter);

        $scope.isLoading=true;

        function query(str) {
          var query=new $bend.Query();
          if(str==="") return query;
          var q2 = new $bend.Query().matches("username",str,{
              ignoreCase: true
            })
            .or().matches("firstName",str,{
              ignoreCase: true
            })
            .or().matches("lastName",str,{
              ignoreCase: true
            });
          return query.and(q2);
        }

        console.log($scope.collectionView);

        var q = query($scope.collectionView.searchTerm);

        if($scope.isOrgAdmin) {
          q.equalTo("orgCode", $scope.currentUser.orgCode);
        }

        if($rootScope.globals.userSearchFilter.customQuery != "") {
          q.and($rootScope.globals.userSearchFilter.customQuery);
          $rootScope.globals.userSearchFilter.customQuery = "";
        }
        if($scope.collectionView.searchRole)
          q.equalTo("role", Number($scope.collectionView.searchRole));
        if($scope.collectionView.searchPlan)
          q.equalTo("subscriptionType", Number($scope.collectionView.searchPlan));
        q.notEqualTo("deleted", true);

        $scope.sortFilter.map(function(o){
          if($scope.sortDir)
            q.descending(o);
          else
            q.ascending(o)
        })
        q.limit($scope.collectionView.itemsPerPage);
        q.skip(($scope.collectionView.currentPage-1)*$scope.collectionView.itemsPerPage);

        $bend.User.find(q, {
          relations:{
            avatar:"BendFile"
          }
        }).then(function(users) {
          $scope.userList = users;
          $scope.isLoading = false;
        }, function(error) {
          console.log(error);
        });

        $bend.User.count(q).then(function(count){
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
        $scope.loadUsers();
      };

      $scope.sortToggle = function(sortFilters, idx, $ev, noChange) {
        if($ev) {
          $ev.stopPropagation();
          $ev.preventDefault();
        }
        $scope.sortFilter = sortFilters;

        if(!noChange)
          $scope.sortFlag[idx] = !$scope.sortFlag[idx];
        $scope.sortDir = !$scope.sortFlag[idx];
        //save current sort setting
        $cookieStore.put(BendAuth.getActiveUser()._id + "_sort", {
          sortFilters:sortFilters,
          idx:idx
        });
        setTimeout(function(){
          $(".sort-dir").html("");
          if($scope.sortDir)
            $(".sort-dir-" + idx).html("&#9660;");
          else
            $(".sort-dir-" + idx).html("&#9650;");
        }, 100);

        $scope.loadUsers();

      }

      var sortSetting = $cookieStore.get(BendAuth.getActiveUser()._id + "_sort");
      if(sortSetting) {
        $scope.sortToggle(sortSetting.sortFilters, sortSetting.idx, null, true);
      } else
        $scope.sortToggle(['_bmd.createdAt'], 4, null, true);

      $scope.onPageChange = function() {
        $cookieStore.put(BendAuth.getActiveUser()._id + "_pageNum", $scope.collectionView.itemsPerPage);
        $scope.loadUsers();
      };

      $rootScope.editUser = function(user) {
        console.log("called edit", user);
        return $location.path("/users/edit/" + user._id);
      }

      $rootScope.addUser = function(user) {
        $scope.userList.push(user);
      }

      $scope.createUser = function() {
        if($rootScope.globals.isAdmin) {
          $location.path("/users/create");
        } else {
          $scope.invite();
        }
      };

      $scope.toggleAdmin = function(user, e) {
        e.stopPropagation();
        e.preventDefault();
        if($scope.isOrgAdmin) {
          return;
        }
        user.isOrgAdmin = !user.isOrgAdmin;
        var _u = _.clone(user);
        delete _u.$$hashKey;
        $bend.execute("update-user", {userData:_u}).then(function(ret){
          console.log(ret);
        }, function(err){
          console.log(err);
        });
      }

      $scope.invite = function() {
        var modalInstance = $modal.open({
          templateUrl: 'inviteForm.html',
          controller: function ($scope, $modalInstance, org, invitations) {
            $scope.form = {};
            $scope.org = org;
            $scope.invitations = invitations;

            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.close = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.inviteDo = function () {
              //leave service
              BendService.inviteUser($scope.org, $scope.form.email, function(err, ret) {
                console.log(err, ret);
                $modalInstance.dismiss('cancel');
              });
            };
            $scope.canSubmitValidationForm = function() {
              return $scope.form.validateForm.$valid;
            };
          },
          resolve: {
            org: function () {
              return $scope.org;
            },

            invitations:function () {
              return $scope.invitations;
            },
          }
        });
      }
    }]);



