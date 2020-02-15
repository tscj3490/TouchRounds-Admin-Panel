'use strict'

angular
  .module('app.service', [])
  .factory('BendService', [
    '$location', '$bend', 'BendAuth','BendPusher','$rootScope', 'CommonUtil', '$cookieStore', function ($location, $bend, BendAuth, BendPusher, $rootScope, CommonUtil, $cookieStore) {
      var BendService = {};

      BendService.init = function() {
        $rootScope.globals = {
          userSearchFilter :{
            searchTerm:"",
            searchRole:"",
            searchPlan:"",
            customQuery:"",
            sortFlag:[false, false, false, false, false, false, false]
          },
          isAdmin:false
        };
        var stateObj = $cookieStore.get(BendAuth.getActiveUser()._id + "_state");
        console.log("cookie data", BendAuth.getActiveUser()._id, stateObj);
        if(stateObj)
          $rootScope.globals.state = stateObj;
      }

      BendService.getFile = function(refObj, callback) {
        if(refObj) {
          var query = new $bend.Query();
          query.equalTo("_id", refObj._id);
          $bend.File.find(query).then(function(rets){
            callback(rets[0]);
          }, function(err){
            console.log(err);
          })
        } else {
          callback(refObj);
        }
      }

      BendService.upload = function (file, callback,ext, progressCallback) {
        var obj = {
          _filename: file.name,
          size: file.size,
          mimeType: file.type
        };

        if(ext) {
          _.extend(obj,ext);
        }

        console.log("Upload params:");
        console.log(obj);

        $bend.File.upload(file, obj, {"public": true}, function(res){
          console.log(res);
          callback(null, res);
        }, function(total, prog){
          if(progressCallback) {
            progressCallback(total, prog);
          }
        }).then(function (res) {
          //callback(null, res);
        }, function (error) {
          callback(error);
        });
      }

      //user
      BendService.getUserList = function(callback) {
        var query = new $bend.Query();
        /*query.notEqualTo("deleted", true);*/
        query.descending("_bmd.createdAt")
        $bend.User.find(query).then(function(users){
          console.log(users);
          callback(users);
        }, function(err){
          console.log(err);
        })
      }

      BendService.checkUserName = function(username, callback) {
        var query = new $bend.Query();
        query.matches("username", new RegExp("^" + username + "$", "gi"));
        $bend.User.find(query).then(function(ret){
          if(ret&&ret.length > 0)
            callback(true);
          else
            callback(false);
        }, function(err){
          callback(err);
          //console.log(err);
        })
      }

      BendService.getValidUserList = function(callback) {
        var query = new $bend.Query();
        query.equalTo("enabled", true);
        /*query.notEqualTo("deleted", true);*/
        query.ascending("firstName").ascending("lastName");
        $bend.User.find(query).then(function(users){
          console.log(users);
          callback(users);
        }, function(err){
          console.log(err);
        })
      }

      BendService.searchUserList = function(searchWords, callback) {
        var query = new $bend.Query();
        query.equalTo("enabled", true);
        /*query.notEqualTo("deleted", true);*/
        query.ascending("username");

        query.matches("username", new RegExp('' + searchWords + '+', 'gi'));
        $bend.User.find(query).then(function(users){
          users.map(function(o){
            o.fullName = o.firstName + " " + o.lastName;
          })
          callback(users);
        }, function(err){
          console.log(err);
        })
      }

      BendService.searchUserPage = function(param) {
        var query = new $bend.Query();
        /*query.notEqualTo("deleted", true);*/
        query.ascending("firstName").ascending("lastName");
        if(param.selectedUserType == 1)
          query.notEqualTo("provider", true);
        else if(param.selectedUserType == 2) {
          query.equalTo("provider", true);
        }
        if(param.searchUserText != "")
          query.and(new $bend.Query().matches("firstName", new RegExp('' + param.searchUserText + '+', 'gi'))
            .or(new $bend.Query().matches("lastName", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("email", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("username", new RegExp('' + param.searchUserText + '+', 'gi'))));
        query.limit(param.limit).skip(param.limit * (param.page - 1))

        return $bend.User.find(query, {
          relations:{ avatar:"BendFile"}
        });
      }

      BendService.getUserPageTotalCount = function(param, callback) {
        var query = new $bend.Query();
        /*query.notEqualTo("deleted", true);*/
        query.ascending("firstName").ascending("lastName");
        if(param.searchUserText && param.searchUserText != "")
          query.and(new $bend.Query().matches("firstName", new RegExp('' + param.searchUserText + '+', 'gi'))
            .or(new $bend.Query().matches("lastName", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("email", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("username", new RegExp('' + param.searchUserText + '+', 'gi'))));
        if(param.selectedUserType == 1)
          query.notEqualTo("provider", true);
        else if(param.selectedUserType == 2) {
          query.equalTo("provider", true);
        }

        $bend.User.count(query).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getAllUserCount = function(param, callback) {
        var query = new $bend.Query();
       /* query.notEqualTo("deleted", true);*/
        query.ascending("firstName").ascending("lastName");
        if(param.searchUserText && param.searchUserText != "")
          query.and(new $bend.Query().matches("firstName", new RegExp('' + param.searchUserText + '+', 'gi'))
            .or(new $bend.Query().matches("lastName", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("email", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("username", new RegExp('' + param.searchUserText + '+', 'gi'))));

        $bend.User.count(query).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getNormalUserCount = function(param, callback) {
        var query = new $bend.Query();
        /*query.notEqualTo("deleted", true);*/
        query.ascending("firstName").ascending("lastName");
        if(param.searchUserText && param.searchUserText != "")
          query.and(new $bend.Query().matches("firstName", new RegExp('' + param.searchUserText + '+', 'gi'))
            .or(new $bend.Query().matches("lastName", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("email", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("username", new RegExp('' + param.searchUserText + '+', 'gi'))));
        query.notEqualTo("provider", true);

        $bend.User.count(query).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getUser = function(userId, callback) {
        $bend.User.get(userId, {
          relations:{
            avatar:"BendFile"
          }
        }).then(function(user){
          callback(user);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createUser = function(Data, callback){
        var userData = _.clone(Data);

        delete userData.passwordConfirm;

        $bend.User.create(userData, {
          state: false
        }).then(function(ret){
          console.log(ret);
          callback(ret);

          //create "createuser" event
          $bend.DataStore.save("event", {
            type:'createuser',
            user:ret._id,
            date:CommonUtil.getToday()
          }).then(function(ret){
            console.log(ret);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        })
      }

      BendService.updateUser = function(user, callback){
        var userData = _.clone(user);
        delete userData.$$hashKey;

        $bend.User.update(userData).then(function(ret){
          console.log(ret);
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteUser = function(id, callback){
        $bend.User.destroy(id).then(function(ret){
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        });
      }

      BendService.setUserAsAdmin = function(userId, isAdmin, callback) {
        var authString = "Bend " + BendAuth.getActiveUser()._bmd.authtoken;
        $.ajax({
          url: BendAuth.URL + BendAuth.APP_KEY + "/" + BendAuth.GROUP_ID,
          headers: {"Authorization": authString}
        }).then(function(ret){
          var adminList = ret.users.list;

          var adminUser = _.find(adminList, function(o){
            return o._id == userId;
          })

          if(isAdmin) { //add
            if(adminUser) {
              //nothing do
              callback(null);
            } else {
              adminList.push(CommonUtil.makeBendRef(userId, "user"));
            }
          } else { //remove
            if(adminUser) {
              var idx = adminList.indexOf(adminUser);
              adminList.splice(idx, 1);
            } else {
              //nothing do
              callback(null);
            }
          }

          $.ajax({
            url: BendAuth.URL + BendAuth.APP_KEY + "/" + BendAuth.GROUP_ID,
            headers: {"Authorization": authString},
            type: 'PUT',
            data: JSON.stringify(ret)
          }).then(function(ret){
            console.log(ret);
            callback(null);
          }, function(err){
            console.log(err);
            callback(err);
          })

        }, function(err){
          callback(err);
          console.log(err);
        });
      }

      //organization
      BendService.getOrganizationById = function(orgId, callback) {
        $bend.DataStore.get("organization", orgId).then(function(ret){
          if(callback){
            callback(null, ret);
          }
        }, function(err){
          console.log(err);
          if(callback){
            callback(err, null);
          }
        })
      }

      BendService.getOrganization = function(orgCode, callback) {
        var query = new $bend.Query();
        query.equalTo("code", orgCode);
        $bend.DataStore.find("organization", query).then(function(rets){
          if(callback){
            if(rets.length > 0)
              callback(null, rets[0]);
            else
              callback(null, null);
          }
        }, function(err){
          console.log(err);
          if(callback){
            callback(err, null);
          }
        })
      }

      BendService.createOrganization = function(org, callback) {
        $bend.DataStore.save("organization", org).then(function(ret){
          if(callback){
            callback(null, ret);
          }
        }, function(err){
          console.log(err);
          if(callback){
            callback(err, null);
          }
        })
      }

      BendService.updateOrganization = function(org, callback) {
        $bend.DataStore.update("organization", org).then(function(ret){
          if(callback){
            callback(null, ret);
          }
        }, function(err){
          console.log(err);
          if(callback){
            callback(err, null);
          }
        })
      }

      BendService.deleteOrganization = function(org, users, callback2) {
        async.parallel([
          function(callback){
            async.map(users, function(u, _callback){
              var _u = _.clone(u);
              delete _u.$$hashKey;
              delete _u.orgCode;
              delete _u.isOrgAdmin;
              $bend.User.update(_u).then(function(ret){
                _callback(null, ret);
              }, function(err){
                _callback(err, null);
              })
            }, function(err, ret){
              callback(err, ret);
            })
          },
          function(callback) {
            org.deleted = true;
            $bend.DataStore.update("organization", org).then(function(ret){
              callback(null, ret);
            }, function(err){
              callback(err, null);
            })
          }
        ], function(err, ret){
          callback2(err, ret);
        })
      }

      BendService.addOrganizationUser = function(user, org, isAdmin, callback) {
        user.orgCode = org.code;
        user.isOrgAdmin = isAdmin;
        if(org.expirationDate) {
          if(!user.expirationDate || user.expirationDate < org.expirationDate)
            user.expirationDate = org.expirationDate;
        }

        $bend.User.update(user).then(function(retUser){
          org.usersCount++;
          $bend.DataStore.update("organization", org).then(function(ret){
            callback(null, retUser);
          }, function(err){
            callback(err, null);
          });
        }, function(err){
          console.log(err);
          if(callback){
            callback(err, null);
          }
        })
      }

      BendService.getOrganizationUsers = function(orgCode, callback) {
        var query = new $bend.Query();
        query.equalTo("orgCode", orgCode);
        $bend.User.find(query).then(function(rets){
          callback(null, rets);
        }, function(err){
          console.log(err);
          if(callback){
            callback(err, null);
          }
        })
      }

      BendService.deleteOrganizationUser = function(user, org, callback) {
        delete user.orgCode;
        $bend.User.update(user).then(function(ret){
          org.usersCount--;
          $bend.DataStore.update("organization", org).then(function(ret){
            callback(null, true);
          }, function(err){
            callback(err, null);
          });
        }, function(err){
          console.log(err);
          if(callback){
            callback(err, null);
          }
        })
      }

      BendService.setOrganizationUserAsAdmin = function(user, isAdmin, callback) {
        user.isOrgAdmin = isAdmin;
        $bend.User.update(user).then(function(ret){
          callback(null, ret);
        }, function(err){
          console.log(err);
          if(callback){
            callback(err, null);
          }
        })
      }

      BendService.cancelInvite = function(inviteUser, callback) {
        $bend.execute("cancel-invitation", {inviteUserId:inviteUser._id}).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.inviteUser = function(org, userEmail, callback) {
        //check if this user exists
        var query = new $bend.Query();
        query.equalTo("username", userEmail);
        $bend.User.find(query).then(function(rets){
          if(rets.length > 0) {//exist
            //send email
            $bend.execute("send-existing-user-invitation-for-organization", {
              email:userEmail,
              org:org,
              senderFirstName:$bend.getActiveUser().firstName,
              senderLastName:$bend.getActiveUser().lastName
            }).then(function(ret){
              callback(null, ret);
            }, function(err){
              callback(err, null);
            })
          } else {
            $bend.execute("send-invitation-email-for-organization", {
              email:userEmail,
              org:org,
              senderFirstName:$bend.getActiveUser().firstName,
              senderLastName:$bend.getActiveUser().lastName
            }).then(function(ret){
              callback(null, ret);
            }, function(err){
              callback(err, null);
            })
          }
        })
      }

      return BendService;
    }
  ]);
