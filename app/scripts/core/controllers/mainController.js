angular.module('theme.core.main_controller',
  [
    'theme.core.services',
    'bend',
    'app.auth',
  ])
  .controller('MainController', ['$scope', '$theme', '$timeout', 'progressLoader', '$location',  'BendAuth','BendService','$rootScope','$modal','$bend','pinesNotifications', 'CommonUtil',
    function($scope, $theme, $timeout, progressLoader, $location, BendAuth,BendService, $rootScope, $modal, $bend, pinesNotifications, CommonUtil) {
      'use strict';
      // $scope.layoutIsSmallScreen = false;
      $scope.layoutFixedHeader = $theme.get('fixedHeader');
      $scope.layoutPageTransitionStyle = $theme.get('pageTransitionStyle');
      $scope.layoutDropdownTransitionStyle = $theme.get('dropdownTransitionStyle');
      $scope.layoutPageTransitionStyleList = ['bounce',
        'flash',
        'pulse',
        'bounceIn',
        'bounceInDown',
        'bounceInLeft',
        'bounceInRight',
        'bounceInUp',
        'fadeIn',
        'fadeInDown',
        'fadeInDownBig',
        'fadeInLeft',
        'fadeInLeftBig',
        'fadeInRight',
        'fadeInRightBig',
        'fadeInUp',
        'fadeInUpBig',
        'flipInX',
        'flipInY',
        'lightSpeedIn',
        'rotateIn',
        'rotateInDownLeft',
        'rotateInDownRight',
        'rotateInUpLeft',
        'rotateInUpRight',
        'rollIn',
        'zoomIn',
        'zoomInDown',
        'zoomInLeft',
        'zoomInRight',
        'zoomInUp'
      ];

      $scope.layoutLoading = true;
      $scope.userInfo = null;
      $scope.CommonUtil = CommonUtil;
      $scope.org = {};

      $scope.initUser = function() {
        BendService.getUser(BendAuth.getActiveUser()._id, function(ret){
          //console.log("user", ret);
          $scope.userInfo = ret;
          if(!$rootScope.globals.isAdmin) {
            BendService.getOrganization(ret.orgCode, function(err, ret){
              if(err) {
                console.log(err); return;
              }
              $scope.org = ret;
            })
          }
        })
      }

      if(BendAuth.isLoggedIn()) {
        $scope.initUser();
      }

      $scope.$on("login_initialize", function(){
        $scope.initUser();
      })

      $scope.getLayoutOption = function(key) {
        return $theme.get(key);
      };

      $scope.setNavbarClass = function(classname, $event) {
        $event.preventDefault();
        $event.stopPropagation();
        $theme.set('topNavThemeClass', classname);
      };

      $scope.setSidebarClass = function(classname, $event) {
        $event.preventDefault();
        $event.stopPropagation();
        $theme.set('sidebarThemeClass', classname);
      };

      $scope.$watch('layoutFixedHeader', function(newVal, oldval) {
        if (newVal === undefined || newVal === oldval) {
          return;
        }
        $theme.set('fixedHeader', newVal);
      });
      $scope.$watch('layoutLayoutBoxed', function(newVal, oldval) {
        if (newVal === undefined || newVal === oldval) {
          return;
        }
        $theme.set('layoutBoxed', newVal);
      });
      $scope.$watch('layoutLayoutHorizontal', function(newVal, oldval) {
        if (newVal === undefined || newVal === oldval) {
          return;
        }
        $theme.set('layoutHorizontal', newVal);
      });
      $scope.$watch('layoutPageTransitionStyle', function(newVal) {
        $theme.set('pageTransitionStyle', newVal);
      });
      $scope.$watch('layoutDropdownTransitionStyle', function(newVal) {
        $theme.set('dropdownTransitionStyle', newVal);
      });

      $scope.hideHeaderBar = function() {
        $theme.set('headerBarHidden', true);
      };

      $scope.showHeaderBar = function($event) {
        $event.stopPropagation();
        $theme.set('headerBarHidden', false);
      };

      $scope.toggleLeftBar = function() {
        if ($scope.layoutIsSmallScreen) {
          return $theme.set('leftbarShown', !$theme.get('leftbarShown'));
        }
        $theme.set('leftbarCollapsed', !$theme.get('leftbarCollapsed'));
      };

      $scope.toggleRightBar = function() {
        $theme.set('rightbarCollapsed', !$theme.get('rightbarCollapsed'));
      };

      $scope.toggleSearchBar = function($event) {
        $event.stopPropagation();
        $event.preventDefault();
        $theme.set('showSmallSearchBar', !$theme.get('showSmallSearchBar'));
      };

      $scope.chatters = [{
        id: 0,
        status: 'online',
        avatar: 'potter.png',
        name: 'Jeremy Potter'
      }, {
        id: 1,
        status: 'online',
        avatar: 'tennant.png',
        name: 'David Tennant'
      }, {
        id: 2,
        status: 'online',
        avatar: 'johansson.png',
        name: 'Anna Johansson'
      }, {
        id: 3,
        status: 'busy',
        avatar: 'jackson.png',
        name: 'Eric Jackson'
      }, {
        id: 4,
        status: 'online',
        avatar: 'jobs.png',
        name: 'Howard Jobs'
      }, {
        id: 5,
        status: 'online',
        avatar: 'potter.png',
        name: 'Jeremy Potter'
      }, {
        id: 6,
        status: 'away',
        avatar: 'tennant.png',
        name: 'David Tennant'
      }, {
        id: 7,
        status: 'away',
        avatar: 'johansson.png',
        name: 'Anna Johansson'
      }, {
        id: 8,
        status: 'online',
        avatar: 'jackson.png',
        name: 'Eric Jackson'
      }, {
        id: 9,
        status: 'online',
        avatar: 'jobs.png',
        name: 'Howard Jobs'
      }];
      $scope.currentChatterId = null;
      $scope.hideChatBox = function() {
        $theme.set('showChatBox', false);
      };
      $scope.toggleChatBox = function(chatter, $event) {
        $event.preventDefault();
        if ($scope.currentChatterId === chatter.id) {
          $theme.set('showChatBox', !$theme.get('showChatBox'));
        } else {
          $theme.set('showChatBox', true);
        }
        $scope.currentChatterId = chatter.id;
      };

      $scope.hideChatBox = function() {
        $theme.set('showChatBox', false);
      };

      $scope.$on('themeEvent:maxWidth767', function(event, newVal) {
        $timeout(function() {
          $scope.layoutIsSmallScreen = newVal;
          if (!newVal) {
            $theme.set('leftbarShown', false);
          } else {
            $theme.set('leftbarCollapsed', false);
          }
        });
      });
      $scope.$on('themeEvent:changed:fixedHeader', function(event, newVal) {
        $scope.layoutFixedHeader = newVal;
      });
      $scope.$on('themeEvent:changed:layoutHorizontal', function(event, newVal) {
        $scope.layoutLayoutHorizontal = newVal;
      });
      $scope.$on('themeEvent:changed:layoutBoxed', function(event, newVal) {
        $scope.layoutLayoutBoxed = newVal;
      });

      // there are better ways to do this, e.g. using a dedicated service
      // but for the purposes of this demo this will do :P
      $scope.isLoggedIn = true;
      $scope.logOut = function() {
        BendAuth.logOut();
      };
      $scope.logIn = function() {
        $scope.isLoggedIn = true;
      };

      $scope.getUserName = function() {
        var user = BendAuth.getActiveUser();
        if(user)
          return user.lastName + ", " + user.firstName;
        else
          return "";
      }

      $scope.rightbarAccordionsShowOne = false;
      $scope.rightbarAccordions = [{
        open: true
      }, {
        open: true
      }, {
        open: true
      }, {
        open: true
      }, {
        open: true
      }, {
        open: true
      }, {
        open: true
      }];

      $scope.$on('$routeChangeStart', function() {
        BendAuth.checkAuth();

        progressLoader.start();
        progressLoader.set(50);
      });
      $scope.$on('$routeChangeSuccess', function() {
        progressLoader.end();
        if ($scope.layoutLoading) {
          $scope.layoutLoading = false;
        }
      });

      $scope.$on("update-organization", function(evt, org){
        console.log(org)
        $scope.org.name = org.name
      })

      $scope.openProfile = function() {
        var modalInstance = $modal.open({
          templateUrl: 'userProfile.html',
          controller: function ($scope, $modalInstance) {
            $scope.isLoadingSaveProfile = false;
            $scope.isLoadingSaveAccout = false;
            var activeUser = BendAuth.getActiveUser();
            $scope.selectedService = {};
            $scope.roleList = [
              {id:0, name:'Attending'},
              {id:1, name:'Fellow'},
              {id:2, name:'Nurse'},
              {id:3, name:'Nurse Practitioner'},
              {id:4, name:'Physican\'s Assistant'},
              {id:5, name:'Resident'},
              {id:6, name:'Student'}];

            $scope.user = activeUser;
            $scope.form = {
              firstName: $scope.user.firstName,
              lastName: $scope.user.lastName,
              role: _.find($scope.roleList, function(o){
                return o.id == $scope.user.role;
              }),
              username:  $scope.user.username,
            };
            $scope.form.isValidPassword = false;

            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.close = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.saveProfile = function () {
              $scope.isLoadingSaveProfile = true;
              activeUser.firstName = $scope.form.firstName;
              activeUser.lastName = $scope.form.lastName;
              activeUser.role = $scope.form.role.id;
              $bend.User.update(activeUser).then(function(user){
                $scope.isLoadingSaveProfile = false;
              }, function(err){
                console.log(err);
                $scope.isLoadingSaveProfile = false;
              });
            };

            $scope.saveAccount = function () {
              var activeUserClone = _.clone(activeUser);
              $bend.setActiveUser(null);
              var credentials = {username:activeUser.username, password:$scope.form.oldPassword};
              $bend.User.login(credentials).then(
                function (res) {
                  $scope.isLoadingSaveAccout = true;
                  activeUser = BendAuth.getActiveUser();
                  activeUser.password = $scope.form.newPassword;
                  $bend.User.update(activeUser).then(function(user){
                    var creditial = {username:activeUser.username, password:$scope.form.newPassword};
                    $bend.Sync.destruct();
                    $bend.setActiveUser(null);
                    $scope.isLoadingSaveAccout = false;
                    BendAuth.logIn(creditial);

                    var notify = pinesNotifications.notify({
                      text: '<p>Password changed</p>',
                      type: 'info',
                      width:"200px"
                    });
                    setTimeout(function(){
                      notify.remove();
                    }, 2000);
                    //return $location.path('/signin');
                  }, function(err){
                    console.log(err);
                    $scope.isLoadingSaveAccout = false;
                  });
                },
                function (error) {
                  console.log(error);
                  $scope.form.isValidPassword = true;
                  $bend.setActiveUser(activeUserClone);
                  activeUser = BendAuth.getActiveUser();
                }
              );
            };

            $scope.canSubmitValidationForm = function() {
              return $scope.form.validateForm.$valid;
            };
            $scope.canSubmitAccountForm = function() {
              return $scope.form.accountForm.$valid;
            };

            $scope.getSubscriptionPlan = function() {
              var activeUser = BendAuth.getActiveUser();
              switch(activeUser.subscriptionType) {
                case 0: return "Free Trial";
                case 1: return "No Subscriprion";
                case 2: return "Weekly Subsciption";
                case 3: return "Monthly Subsciption";
                case 4: return "Annual Subscription";
                case 5: return "Enterprise Subscription";
                case 6: return "Trainee";
              }

              return "Free Trial";
            }

            $scope.subscriptionLabel = "Subscription Status";
            $scope.getSubsciptionStatus = function() {
              var activeUser = BendAuth.getActiveUser();
              var now = new Date().getTime() * 1000000;
              if(activeUser.subscriptionType == 0 || activeUser.subscriptionType == 1 || activeUser.subscriptionType == 6 ) {
                /*if(activeUser.expirationDateFreeTrial) {
                  if(activeUser.expirationDateFreeTrial < now) {
                    return "Subscription Expired";
                  } else {
                    $scope.subscriptionLabel = "Subscription Ends:"
                    return CommonUtil.formatDate(activeUser.expirationDateFreeTrial);
                  }
                } else {
                  return "Subscription Expired";
                }*/
                if(activeUser.expirationDate) {
                  if(activeUser.expirationDate < now) {
                    return "Subscription Expired";
                  } else {
                    $scope.subscriptionLabel = "Subscription Ends:"
                    return CommonUtil.formatDate(activeUser.expirationDate);
                  }
                } else {
                  return "Subscription Expired";
                }
              } else if(activeUser.subscriptionType == 2 || activeUser.subscriptionType == 3 || activeUser.subscriptionType == 4 ) {
                if(activeUser.expirationDate) {
                  if(activeUser.expirationDate < now) {
                    return "Subscription Expired";
                  } else {
                    $scope.subscriptionLabel = "Subscription Ends:"
                    return CommonUtil.formatDate(activeUser.expirationDate);
                  }
                } else {
                  return "Subscription Expired";
                }
              } else {
                return "Active";
              }
            }
          },
          size: 'lg',
        });
      }

    }]);
