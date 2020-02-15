'use strict'

angular
    .module('app.services', [])
    .factory('pinesNotifications', function () {
        return {
            notify: function (args) {
                var notification = new PNotify(args);
                notification.notify = notification.update;
                return notification;
            },
        }
    })
    .service('PromptModal', ['$modal', function ($modal) {
        return {
            show: function (options) {

                options.validateName = options.validateName || function () {
                    };

                var modalInstance = $modal.open({
                    templateUrl: 'views/templates/prompt-modal.html',
                    backdrop: 'static',
                    controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {

                        $scope.model = {
                            title: options.title,
                            description: options.description,
                            proceedButtonText: options.proceedButtonText,
                            placeholder: options.placeholder,
                            value: options.value
                        };

                        $scope.onInputEnter = function () {
                            if ($scope.validate()) {
                                $scope.proceed();
                            }
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss("cancel");
                        };

                        $scope.proceed = function () {
                            $modalInstance.close($scope.model.value);
                        };

                        $scope.validate = function () {
                            return $scope.model.value && !$scope.validateValue()
                        };

                        $scope.validateValue = function () {
                            if (_.isEmpty($scope.model.value)) {
                                return;
                            }

                            return options.validateName($scope.model.value);
                        };

                    }]
                });

                return modalInstance.result;
            }
        };
    }])
    .service('FormModal', ['$modal', function ($modal) {
        return {
            show: function (options) {

                options.validateName = options.validateName || function () {
                    };

                var modalInstance = $modal.open({
                    templateUrl: options.formTemplate,
                    backdrop: 'static',
                    size:options.size ? options.size : 'md',
                    controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
						$scope.isModal=true;

						$scope.cancel = function () {
                            $modalInstance.dismiss("cancel");
                        };
                        if (options.model) $scope.model=options.model;

						$scope.proceed = function (model) {
                            $modalInstance.close(model);
                        };

                    }]
                });

                return modalInstance.result;
            }
        };
    }])
     .service('DeleteModal',['$modal',function($modal){
        return {
            show: function(options) {

                options.validateName = options.validateName || function() {};

                var modalInstance = $modal.open({
                    templateUrl: 'views/templates/delete-modal.html',
                    backdrop: 'static',
                    controller: ['$scope','$modalInstance',function ($scope, $modalInstance) {
                    	$scope.isDeleting=false;
						$scope.size='sm';
                        $scope.model = {
                            imgUrl: options.imgUrl,
                            title: options.title,
                            text: options.text
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss("cancel");
                        };
                        $scope.ok = function () {
                        	$scope.isDeleting=true;
							options.onDelete(function(){
								$scope.isDeleting=false;
								$modalInstance.close();
							})
                        };
                    }]
                });

                return modalInstance.result;
            }
        };
    }])
    .service("CommonModals",['$bootbox',function($bootbox){
        return {
            confirmRemove: function(title,message,callback) {
                $bootbox.dialog({
                    title: title,
                    message: message,
                    buttons: {
                        danger: {
                            label: "Delete",
                            className: "btn-danger",
                            callback: callback
                        },
                        main: {
                            label: "Cancel",
                            className: "btn-default"
                        }
                    }
                });

            }
        }
    }])
    .service('TilesModal',['$modal',function($modal){
        return {
            show: function(options) {

                options.validateName = options.validateName || function() {};

                var modalInstance = $modal.open({
                    templateUrl: 'views/templates/tiles-modal.html',
                    backdrop: 'static',
                    size:options.size ? options.size : 'lg',
                    controller: ['$scope','$modalInstance',function ($scope, $modalInstance) {
                        $scope.title = options.title;
                        $scope.picture = options.picture;
                        $scope.tiles = options.tiles;
                        $scope.order = options.order;
                        $scope.includeTemplateUrl = options.includeTemplateUrl;
                        $scope.isInitializing = true;

                        $scope.cancel = function () {
                            $modalInstance.dismiss("cancel");
                        };

                        options.initialize(function(err, res){
                        	$scope.data=res;
                        	_.each(res, function(value, key){
                        		if ($scope.tiles[key]) {
                        			$scope.tiles[key].text=value ? value : '-';
                        		}
                        	});
                        	$scope.isInitializing=false;
                        });
                    }]
                });

                return modalInstance.result;
            }
        };
    }]);

