'use strict'

angular
    .module('app.model', [])
    .service('BendUtils',['$bend', function($bend){
    return {
      bendRef: function(collection,id) {
        return {
          _collection: collection,
          _type: "BendRef",
          _id: id
        }
      },
      bendUserRef: function(id) {
        return this.bendRef("user",id);
      },
      bendFileRef: function(id) {
        return {
          _id: id,
          _type: "BendFile"
        }
      },
      wrapInCallback: function(promise,callback) {
        if(!promise) {
          throw new Error("Promise is required!");
          return;
        }
        promise.then(
          function (response) { callback(null,response); },
          function(error) { callback(error); }
        );
      },
      count:function(collection,query,callback) {
        if (!query) {
          query = new $bend.Query();
        }
        query.notEqualTo("deleted", true);
        this.wrapInCallback($bend.DataStore.count(collection,query),callback);
      },
      fetch: function(collection,query,options,callback) {
        if (!query) {
          query = new $bend.Query();
        }
        var fn = collection === "user_" ? $bend.User.find : $bend.DataStore.find;
        //Fetch only not deleted elements
        query.notEqualTo("deleted", true);
        this.wrapInCallback(fn(collection,query || null,options || {}),callback);
      },
      group: function(collection,group,options,callback) {
        if (!group) {
          group = new $bend.Group();
        }
        var fn = collection === "user_" ? $bend.User.group : $bend.DataStore.group;
        this.wrapInCallback(fn(collection,group || null,options || {}),callback);
      },
      get: function(collection,id,options,callback) {
        var fn = collection === "user" ? $bend.User.get : $bend.DataStore.get;
        this.wrapInCallback(fn(collection,id,options || {}),callback);
      },
      save: function(collection,obj,callback) {
        var fn = collection === "user" ? (obj._id ? $bend.User.update : $bend.User.create) : $bend.DataStore.save;
        this.wrapInCallback(fn(collection,obj),callback);
      },
      update: function(collection,obj,callback) {
        var fn = collection === "user" ? $bend.User.update : $bend.DataStore.update;
        this.wrapInCallback(fn(collection,obj),callback);
      },
      clean: function(collection,query,options,callback) {
        /*
         var fn = $bend.DataStore.clean;
         this.wrapInCallback(fn(collection,query || null,options || {}),callback);
         */

        var that=this;
        //Set objects deleted instead destroy object
        that.fetch(collection,query,options,function(err, res){
          if (err){
            callback(err);
            return;
          }
          async.eachLimit(res,10,function(obj,callback){
            obj.deleted=true;
            that.save(collection,obj, callback);
          },callback);
        });
      },
      cleanFull: function(collection,query,options,callback) {
        var fn = $bend.DataStore.clean;
        this.wrapInCallback(fn(collection,query || null,options || {}),callback);

      },
      destroy: function(collection,id,callback) {
        /*
         var fn = collection === "user" ? $bend.User.destroy : $bend.DataStore.destroy;
         this.wrapInCallback(fn(collection,id),callback);
         */

        var that=this;
        //Set object deleted instead destroy object
        that.get(collection,id,{},function(err, obj){
          if (err){
            callback(err);
            return;
          }
          obj.deleted=true;
          that.save(collection,obj,callback);
        });

      }
    }
  }])
    .service('AppRouter',['$location',function($location){
        return {
            routeToUsersList: function() {
                $location.path("/users");
            }
        };
    }])
    .service('UserModel',['$bend','Collection','BendUtils',function($bend,Collection,BendUtils){
        return {
            isSuperAdmin: function() {
                var me = $bend.getActiveUser();
                if(!me) {
                    return false;
                }

                return me.username === 'admin';
            },
            resetPassword: function(id,pwd,callback) {
                async.waterfall([function(callback){
                    BendUtils.wrapInCallback($bend.User.get(id),callback);
                },function(user,callback){
                    user.password = pwd;
                    BendUtils.wrapInCallback($bend.User.update(user),callback);
                }],callback);
            },
         }
    }]);
