angular.module('app.controllers')
  .controller('DashboardController', ['$scope', '$timeout', '$window', '$bend', 'BendAuth', 'BendService', 'CommonUtil', '$rootScope', '$location','pinesNotifications', '$modal',
    function($scope, $timeout, $window, $bend, BendAuth, BendService, CommonUtil, $rootScope, $location, pinesNotifications, $modal) {
      'use strict';
      var moment = $window.moment;
      var _ = $window._;
      $scope.loadingChartData = false;
      $scope.org = {};
      $scope.editMode = false;
      $scope.formData = {
        expirationDate:""
      }
      $scope.users = [];

      $scope.CommonUtil = CommonUtil;

      $scope.currentUser = BendAuth.getActiveUser();
      if($scope.currentUser.orgCode && $scope.currentUser.isOrgAdmin) {
        BendService.getOrganization($scope.currentUser.orgCode, function(err, ret){
          if(ret){
            $scope.org= ret;
            if (ret.expirationDate)
              $scope.formData.expirationDate = CommonUtil.formatDate(ret.expirationDate);

            if(!$scope.org.usersCount)
              $scope.org.usersCount = 0;
            if(!$scope.org.slotsCount)
              $scope.org.slotsCount = 0;

            //fetch users
            BendService.getOrganizationUsers(ret.code, function(err, rets){
              if(err) {
                console.log(err);
                $scope.isLoading = false;
                return;
              }

              $scope.users = rets;
              $scope.isLoading = false;
            })
          }
        })
      }

      function gd(year, month, day) {
        return new Date(year, month - 1, day).getTime();
      }

      $scope.plotStatsData = [{
        data: [],
        label: 'Daily unique users',
        color: "#FF0000",
        points: { fillColor: "#FF0000", show: true }
      }, {
        data: [],
        label: 'Daily new users',
        color: "#0062E3",
        points: { fillColor: "#0062E3", show: true }
      }];

      $scope.plotStatsOptions = {
        series: {
          stack: false,
          lines: {
            show: true,
            tension: 0.3,
            lineWidth: 3
          },
          points: {
            show: true
          },
          shadowSize: 0
        },
        grid: {
          labelMargin: 10,
          hoverable: true,
          clickable: true,
          borderWidth: 0
        },
        tooltip: true,
        tooltipOpts: {
          defaultTheme: false,
          content: 'View Count: %y'
        },
        colors: ['#b3bcc7'],
        xaxis: {
          mode: "time",
          timeformat: "%m/%d",
          tickColor: 'rgba(0,0,0,0.04)',
          timezone: "browser",
          font: {
            color: 'rgba(0,0,0,0.4)',
            size: 11
          }
        },
        yaxis: {
          tickColor: 'transparent',
          ticks: 4,
          tickDecimals: 0,
          min:0,
          //tickColor: 'rgba(0,0,0,0.04)',
          font: {
            color: 'rgba(0,0,0,0.4)',
            size: 11
          },
          tickFormatter: function(val) {
            if (val > 999) {
              return (val / 1000) + 'K';
            } else {
              return val;
            }
          }
        },
        legend: {
          labelBoxBorderColor: 'transparent',
        }
      };

      $scope.drp_start = moment().subtract(6, 'days').format('MMMM D, YYYY');
      $scope.drp_end = moment().format('MMMM D, YYYY');
      $scope.drp_options = {
        ranges: {
          'Last 7 Days': [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        opens: 'left',
        startDate: moment().subtract(6, 'days'),
        endDate: moment()
      };

      $scope.refreshAction = function(start, end) {
        if(start)
          $scope.drp_start = start;
        if(end)
          $scope.drp_end = end;
        var startTime = moment($scope.drp_start, 'MMMM D, YYYY').unix() * 1000;
        var endTime = moment($scope.drp_end, 'MMMM D, YYYY').unix() * 1000;

        //console.log(start, end, $scope.drp_start, $scope.drp_end, startTime, endTime);

        async.parallel([
          function(callback){ //user activities
            var query = new $bend.Query();
            query.equalTo("type", "login");
            query.greaterThan("date", startTime);
            query.lessThanOrEqualTo("date", endTime);
            var group = $bend.Group.count2('date', 'user');
            group.query(query);

            $bend.DataStore.group("event", group).then(function(rets){
              console.log("login group", rets);
              var userDataList = [];
              for(var dt = startTime; dt <= endTime ; dt += 24 * 3600 * 1000) {
                var userCount = [dt, 0];

                var cnt = _.countBy(rets, function(o){
                  return o.date == dt?'true':'false';
                })

                if(cnt.true > 0)
                  userCount = [dt, cnt.true];

                userDataList.push(userCount);
              }

              $scope.plotStatsData[0].data = userDataList;
              $.plot($("#userGraph"), $scope.plotStatsData, $scope.plotStatsOptions);

              callback(null, null);
            })
          },
          function(callback) { //subscribers
            var query = new $bend.Query();
            query.equalTo("type", "createuser");
            var group = $bend.Group.count('date');
            group.query(query);
            $bend.DataStore.group("event", group).then(function (rets) {
              console.log("createuser", rets);

              var datalist = [];
              for (var dt = startTime; dt <= endTime; dt += 24 * 3600 * 1000) {
                var val = [dt, 0];
                var obj = _.find(rets, function (o) {
                  return o.date == dt;
                })

                if (obj)
                  val = [dt, obj.result];

                datalist.push(val);
              }

              $scope.plotStatsData[1].data = datalist;
              $.plot($("#userGraph"), $scope.plotStatsData, $scope.plotStatsOptions);
              callback(null, null);
            })
          }
        ], function(err, ret){
          $scope.loadingChartData = false;
        })
        $scope.loadingChartData = true;
      };

      if(!($scope.currentUser.orgCode && $scope.currentUser.isOrgAdmin))
        $scope.refreshAction();
      //Show # of users as a widget
      //Show # of active users in last 24 hours, 1 week, 1 month
      //Show # of new users last 24 hours, 1 week, 1 month
      //Show # of paid subscriptions (monthly, annual)

      $scope.data = {
        userCount:0,
        lastDayActiveUsers:0,
        lastWeekActiveUsers:0,
        lastMonthActiveUsers:0,
        lastDayNewUsers:0,
        lastWeekNewUsers:0,
        lastMonthNewUsers:0,
        monthlyPaidSubscriptions:0,
        annualPaidSubscriptions:0,
        teamsCount : 0,
        patientsCount : 0,
        tasksCount : 0,
        notesCount : 0,
      }

      var query = new $bend.Query();
      query.notEqualTo("deleted", true);
      if($scope.currentUser.orgCode && $scope.currentUser.isOrgAdmin) {
        query.equalTo("orgCode", $scope.currentUser.orgCode);
      }

      $bend.User.count(query).then(function(ret){
        $scope.data.userCount = ret;
      }, function(err){
        console.log(err);
      })

      //get teams, patients, tasks count
      $bend.User.find(query).then(function(rets){
        var userIds = []; //real user Ids
        rets.map(function(o){
          userIds.push(o._id);
        })

        var batchList = [];
        for(i = 0 ; i < userIds.length / 50 + 1 ; i ++) {
          batchList[i] = userIds.slice( 50 * i , 50 * (i + 1));
        }

        var serviceIdList = [];
        var availableServiceIdList = [];
        var query2 = new $bend.Query();
        query2.notEqualTo("isDischargeService", true);

        $bend.DataStore.find("service", query2).then(function(services){
          services.map(function(o){
            serviceIdList.push(o._id);
          })

          async.map(batchList, function(o, callback){
            var q = new $bend.Query();
            q.contains("userId", o);
            $bend.DataStore.find("service_user", q).then(function(rets){
              rets.map(function(serviceuser){
                var idx = serviceIdList.indexOf(serviceuser.serviceId);
                if(idx != -1) {
                  availableServiceIdList.push(serviceuser.serviceId);
                  serviceIdList.splice(idx, 1);
                  $scope.data.teamsCount = availableServiceIdList.length;
                }
              })
              callback(null, true);
            })
          }, function(err, rets){
            if(err) {
              console.log(err);
              return;
            }

            $scope.data.teamsCount = availableServiceIdList.length;
            //console.log("unused service:", serviceIdList.length);
            var batchServiceIdList = [];
            for(i = 0 ; i < availableServiceIdList.length / 50 + 1 ; i ++) {
              batchServiceIdList[i] = availableServiceIdList.slice( 50 * i , 50 * (i + 1));
            }

            async.map(batchServiceIdList, function(o, callback){
              var q = new $bend.Query();
              q.contains("serviceId", o);
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
            }, function(err, rets){

            });
          })
        })
      })

      if(!($scope.currentUser.orgCode && $scope.currentUser.isOrgAdmin)) {
        query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.greaterThan('_bmd.createdAt', Date.now() * 1000000 - 24 * 3600 * 1000000000);
        $bend.User.count(query).then(function(ret){
          $scope.data.lastDayNewUsers = ret;
        }, function(err){
          console.log(err);
        })

        query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.greaterThan('_bmd.createdAt', Date.now() * 1000000 - 7 * 24 * 3600 * 1000000000);
        $bend.User.count(query).then(function(ret){
          $scope.data.lastWeekNewUsers = ret;
        }, function(err){
          console.log(err);
        })

        query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.greaterThan('_bmd.createdAt, true', Date.now() * 1000000 - 30 * 24 * 3600 * 1000000000);
        $bend.User.count(query).then(function(ret){
          $scope.data.lastMonthNewUsers = ret;
        }, function(err){
          console.log(err);
        })

        query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.greaterThan("expirationDate", Date.now() * 1000000);
        query.equalTo('subscriptionType', 3);
        $bend.User.count(query).then(function(ret){
          $scope.data.monthlyPaidSubscriptions = ret;
        }, function(err){
          console.log(err);
        })

        query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.equalTo('subscriptionType', 4);
        query.greaterThan("expirationDate", Date.now() * 1000000);
        $bend.User.count(query).then(function(ret){
          $scope.data.annualPaidSubscriptions = ret;
        }, function(err){
          console.log(err);
        })

        query = new $bend.Query();
        query.equalTo("type", "login");
        query.greaterThan('_bmd.createdAt', Date.now() * 1000000 - 24 * 3600 * 1000000000);
        var group = $bend.Group.count2('date', 'user');
        group.query(query);

        $bend.DataStore.group("event", group).then(function(rets){
          $scope.data.lastDayActiveUsers = rets.length;
        });

        query = new $bend.Query();
        query.equalTo("type", "login");
        query.greaterThan('_bmd.createdAt', Date.now() * 1000000 - 7 * 24 * 3600 * 1000000000);
        var group = $bend.Group.count2('date', 'user');
        group.query(query);

        $bend.DataStore.group("event", group).then(function(rets){
          $scope.data.lastWeekActiveUsers = rets.length;
        });

        query = new $bend.Query();
        query.equalTo("type", "login");
        query.greaterThan('_bmd.createdAt', Date.now() * 1000000 - 30 * 24 * 3600 * 1000000000);
        var group = $bend.Group.count2('date', 'user');
        group.query(query);
        $bend.DataStore.group("event", group).then(function(rets){
          $scope.data.lastMonthActiveUsers = rets.length;
        });
      }

      $scope.goMonthlyUserList = function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        $rootScope.globals.userSearchFilter.searchTerm = "";
        $rootScope.globals.userSearchFilter.searchPlan = CommonUtil.planList[3];
        $rootScope.globals.userSearchFilter.searchRole = "";
        return $location.path("/users");
      }

      $scope.goAnnualUserList = function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        $rootScope.globals.userSearchFilter.searchTerm = "";
        $rootScope.globals.userSearchFilter.searchPlan = CommonUtil.planList[4];
        $rootScope.globals.userSearchFilter.searchRole = "";
        return $location.path("/users");
      }

      $scope.goUserList = function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        $rootScope.globals.userSearchFilter.searchTerm = "";
        $rootScope.globals.userSearchFilter.searchPlan = "";
        $rootScope.globals.userSearchFilter.searchRole = "";
        return $location.path("/users");
      }

      $scope.goLastDayActiveUserList = function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        query = new $bend.Query();
        query.greaterThan('lastLoginAt', Date.now() * 1000000 - 24 * 3600 * 1000000000);
        $rootScope.globals.userSearchFilter.customQuery = query;
        return $location.path("/users");
      }

      $scope.goLastDayNewUserList = function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        query = new $bend.Query();
        query.greaterThan('_bmd.createdAt', Date.now() * 1000000 - 24 * 3600 * 1000000000);
        $rootScope.globals.userSearchFilter.customQuery = query;
        return $location.path("/users");
      }

      $scope.goLastWeekActiveUserList = function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        query = new $bend.Query();
        query.greaterThan('lastLoginAt', Date.now() * 1000000 - 7 * 24 * 3600 * 1000000000);
        $rootScope.globals.userSearchFilter.customQuery = query;
        return $location.path("/users");
      }

      $scope.goLastWeekNewUserList = function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        query = new $bend.Query();
        query.greaterThan('_bmd.createdAt', Date.now() * 1000000 - 7 * 24 * 3600 * 1000000000);
        $rootScope.globals.userSearchFilter.customQuery = query;
        return $location.path("/users");
      }

      $scope.goLastMonthActiveUserList = function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        query = new $bend.Query();
        query.greaterThan('lastLoginAt', Date.now() * 1000000 - 30 * 24 * 3600 * 1000000000);
        $rootScope.globals.userSearchFilter.customQuery = query;
        return $location.path("/users");
      }

      $scope.goLastMonthNewUserList = function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        query = new $bend.Query();
        query.greaterThan('_bmd.createdAt', Date.now() * 1000000 - 30 * 24 * 3600 * 1000000000);
        $rootScope.globals.userSearchFilter.customQuery = query;
        return $location.path("/users");
      }

      $scope.goTeams = function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        return $location.path("/teams");
      }

      $scope.edit = function() {
        $scope.editMode = true;
      }

      $scope.saveDo = function() {
        console.log($scope.formData.expirationDate);
        if(typeof $scope.formData.expirationDate == "object") {
          $scope.org.expirationDate = $scope.formData.expirationDate.getTime() * 1000000;
        }

        $bend.execute("update-organization", {orgData:$scope.org}).then(function(ret){
          console.log(ret);
          $scope.editMode = false;

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

      $scope.openDateWindow = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedDateSelector = true;
      };

      $scope.changeOrgName = function() {
        $bend.execute("update-organization", {orgData:$scope.org}).then(function(ret){
          console.log(ret);
          $rootScope.$broadcast("update-organization", $scope.org);
        }, function(err){
          console.log(err);
        })
      }

      $scope.deleteUser = function(user) {
        var _u = _.clone(user);
        delete _u.$$hashKey;
        $bend.execute("remove-user-from-organization", {userData:_u}).then(function(ret){
          console.log(ret);
          var idx = $scope.users.indexOf(user);
          $scope.users.splice(idx, 1);
        }, function(err){
          console.log(err);
        })
      }
      $rootScope.addUserDo = function(user) {
        console.log(user);
        delete user.$$hashKey;
        $bend.execute("add-user-into-organization", {user:user, org:$scope.org}).then(function(ret){
          console.log(ret);
          $scope.users.push(ret);
        }, function(err){
          console.log(err);
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
