'use strict'

angular
  .module('app.directives', [])
  .directive('ngEnter', function() {
    return function(scope, element, attrs) {
      element.bind("keydown keypress", function(event) {
        if(event.which === 13) {
          scope.$apply(function(){
            scope.$eval(attrs.ngEnter, {'event': event});
          });

          event.preventDefault();
        }
      });
    };
  })
  .directive('dragAndDrop', function () {
    return {
      restrict: 'A',
      scope: {
        method:'&dropHandler',
        dragoverevent: '&dragOverHandler',
        dragleaveevent: '&dragLeaveEvent',
        divClass: '&'
      },
      link: function ($scope, elem, attr) {

        elem.bind('dragover', function (e) {
          e.stopPropagation();
          e.preventDefault();

          var event = e.originalEvent;
          if (event && event.dataTransfer) {
            $scope.$apply(function () {
              $scope.dragoverevent({
                files: event.dataTransfer.items
              });
            });
          }
        });

        elem.bind('dragenter', function (e) {
          e.stopPropagation();
          e.preventDefault();
          $scope.$apply(function () {
            elem.addClass('active');
          });
        });

        elem.bind('dragleave', function (e) {
          e.stopPropagation();
          e.preventDefault();
          $scope.$apply(function () {
            elem.removeClass('active');
          });

          var event = e.originalEvent;
          if (event && event.dataTransfer) {
            $scope.$apply(function () {
              $scope.dragoverevent();
            });
          }
        });

        elem.bind('drop', function (e) {
          $scope.$apply(function () {
            elem.removeClass('active');
          });

          e.stopPropagation();
          e.preventDefault();

          var event = e.originalEvent;
          if (event && event.dataTransfer) {
            $scope.$apply(function () {
              $scope.method({
                files: event.dataTransfer.files
              });
            });
          }
        });
      }
    };
  })
  .directive('uploader', function () {
    return {
      restrict: 'E',
      link: function (scope, element) {
        element.find("div").bind("click", function () {
          element.find("input")[0].click();
        });
      }
    }
  })
  .directive('gridView', function ($location, $timeout, $rootScope, $window) {
    return {
      restrict: 'E',
      scope: {
        params: '=',
        filter: '=',
        items: '=',
      },
      templateUrl: 'views/templates/grid-view.html',
      link: function (scope, element, attr) {
        var search=$location.search();
        if (!search.page && !scope.currentPage) {
          scope.currentPage=1;
        }
        else if (search.page){
          scope.currentPage=search.page;
        }
        if (!scope.params) {
          scope.params={};
        }
        scope.getColumns= function(){
          scope.columns=scope.params.columns;
          return scope.columns;
        };
        scope.go = function (event, path, clearSearch ) {
          if (event && (event.ctrlKey || event.metaKey)){
            $window.open('/#'+path, '_blank');
          }
          else {
            $location.path( path );
            if (clearSearch){
              $location.search({});
            }
          }
        };
        if (!scope.params.sortableOptions) {
          scope.params.sortableOptions={disabled:true, items: '__'};
        }
        console.log(scope.items);
        scope.sortBy=function(attr){
          if (!attr) return;
          scope.filter.sortBy=attr;
          var search=$location.search();
          if (search.sortBy==attr){
            if (search.ascending==undefined) search.ascending=1;
            else search.ascending=search.ascending ? 0 : 1;
          }
          else if(search.ascending!=undefined)search.ascending=undefined;
          search.sortBy=attr;

          scope.filter.ascending=search.ascending;
          $location.search(search);
        }
        scope.styleForOverlay=function(){
          var offset=element.parents('.panel-body').first().offset();
          return {top: offset.top-30};
        };

        scope.$watch("filter.itemsPerPage",function(newValue,oldValue){
          $rootScope.setItemsPerPage(newValue);
        });

        scope.$watch("currentPage",function(newValue,oldValue){
          if(newValue!==oldValue) {
            var search=$location.search();
            search.page=scope.currentPage;
            $location.search(search);
          }
        });
      },
      replace: true
    }
  })
  .directive('listView', function ($location, $timeout, $rootScope, $window) {
    return {
      restrict: 'E',
      scope: {
        params: '=',
        filter: '=',
        items: '=',
      },
      templateUrl: 'views/templates/list-view.html',
      link: function (scope, element, attr) {
        var search=$location.search();

        if (!scope.params) {
          scope.params={};
        }
        scope.getColumns= function(){
          scope.columns=scope.params.columns;
          return scope.columns;
        };
        scope.go = function (event, path, clearSearch ) {
          if (event && (event.ctrlKey || event.metaKey)){
            $window.open('/#'+path, '_blank');
          }
          else {
            $location.path( path );
            if (clearSearch){
              $location.search({});
            }
          }
        };
        if (!scope.params.sortableOptions) {
          scope.params.sortableOptions={disabled:true, items: '__'};
        }
        console.log(scope.items);
        scope.sortBy=function(attr){
          if (!attr) return;
          scope.filter.sortBy=attr;
          var search=$location.search();
          if (search.sortBy==attr){
            if (search.ascending==undefined) search.ascending=1;
            else search.ascending=search.ascending ? 0 : 1;
          }
          else if(search.ascending!=undefined)search.ascending=undefined;
          search.sortBy=attr;

          scope.filter.ascending=search.ascending;
          $location.search(search);
        }
        scope.styleForOverlay=function(){
          var offset=element.parents('.panel-body').first().offset();
          return {top: offset.top-30};
        };
      },
      replace: true
    }
  })
  .directive("uploadButton",function(){
    return {
      restrict: "E",
      templateUrl: "views/templates/upload-button.html",
      scope: {
        onFileUpload: "&",
        isUploading: "="
      },
      link: function(scope,element) {

        element.find("input").bind("change",function(event){
          var file=event.target.files[0];
          scope.onFileUpload({file: file});
        });

        element.find("button").bind("click", function () {
          element.find("input")[0].click();
        });
      }
    }})
  .filter('nanoToDate',function(){
    return function(ts) {
      return moment.unix(ts/1000000000).format("MM/DD/YYYY");
    }
  });

