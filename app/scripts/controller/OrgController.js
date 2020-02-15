'use strict'

angular.module('app.controllers')
  .controller('OrgController', ['$scope','$bend','$location','$routeParams', 'BendAuth', 'BendService', 'CommonUtil', '$bootbox','$rootScope','$modal', '$cookieStore',
    function ($scope,$bend,$location, $routeParams, BendAuth, BendService, CommonUtil, $bootbox, $rootScope, $modal, $cookieStore) {

      // Init.
      $scope.orgList = [];
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

      $scope.loadOrgs = function() {
        $scope.isLoading=true;

        function query(str) {
          var query=new $bend.Query();
          if(str==="") return query;
          var q2 = new $bend.Query().matches("name",str,{
              ignoreCase: true
            }).or(new $bend.Query().matches("code",str,{
            ignoreCase: true
          }));
          return query.and(q2);
        }

        console.log($scope.collectionView);
        var q = query($scope.collectionView.searchTerm);
        q.notEqualTo("deleted", true);

        q.limit($scope.collectionView.itemsPerPage);
        q.skip(($scope.collectionView.currentPage-1)*$scope.collectionView.itemsPerPage);

        $bend.DataStore.find("organization", q).then(function(rets) {
          $scope.orgList = rets;
          $scope.isLoading = false;
        }, function(error) {
          console.log(error);
        });

        $bend.DataStore.count("organization", q).then(function(count){
          applyChangesOnScope($scope, function(){
            $scope.collectionView.totalItems=count;
            $scope.collectionView.numPages=$scope.collectionView.totalItems/$scope.collectionView.itemsPerPage+1;
          });
        },function(err){
          console.log(err);
        });
      };

      $scope.loadOrgs();

      $scope.onSearch = function() {
        console.log("On search!");
        $scope.loadOrgs();
      };

      $scope.onPageChange = function() {
        $scope.loadOrgs();
      };

      $rootScope.editOrg = function(org) {
        return $location.path("/organizations/edit/" + org._id);
      }

      $rootScope.addOrg = function(org) {
        $scope.orgList.push(org);
        $scope.collectionView.totalItems++;
      }

      $scope.createOrganization = function() {
        var modalInstance = $modal.open({
          templateUrl: 'createOrganization.html',
          controller: function ($scope, $modalInstance) {
            $scope.orgCode = CommonUtil.randomString(8);
            $scope.orgSlots = 10;
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.close = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.createOrganizationDo = function () {
              $bend.DataStore.save("organization", {
                name:$scope.orgName,
                code:$scope.orgCode,
                email:$scope.orgEmail,
                usersCount:0,
                slotsCount:$scope.orgSlots,
                expirationDate:$scope.expirationDate.getTime() * 1000000,
              }).then(function(ret){
                $rootScope.addOrg(ret);
                $modalInstance.dismiss('cancel');
              }, function(err){
                console.log(err);
              })
            };
            $scope.openDateWindow = function($event) {
              $event.preventDefault();
              $event.stopPropagation();

              $scope.openedDateSelector = true;
            };
            $scope.canSubmitValidationForm = function() {
              return $scope.form.validateForm.$valid;
            };
          },
        });
      };
    }]);



