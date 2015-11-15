(function() {
  'use strict';
  var angApp, query, url_api;

  angApp = angular.module('angApp', ['ngRoute', 'ngResource', 'ngCookies']);

  url_api = 'http://work.insaneit.biz.ua/course/public/api/';

  query = {
    create: {
      method: 'POST'
    },
    index: {
      method: 'GET',
      isArray: true
    },
    show: {
      method: 'GET',
      isArray: false
    },
    update: {
      method: 'PUT'
    },
    destroy: {
      method: 'DELETE'
    }
  };

  angApp.config([
    '$routeProvider', '$locationProvider', function($routeProvide, $locationProvider) {
      return $routeProvide.when('/', {
        templateUrl: 'pages/main.html',
        controller: 'MainCtrl'
      }).when('/login', {
        templateUrl: 'pages/login.html',
        controller: 'UserCtrl'
      }).when('/register', {
        templateUrl: 'pages/register.html',
        controller: 'UserCtrl'
      }).when('/setting', {
        templateUrl: 'pages/setting.html',
        controller: 'UserCtrl'
      }).when('/forget', {
        templateUrl: 'pages/forget.html',
        controller: 'MainCtrl'
      }).when('/message', {
        templateUrl: 'pages/message.html',
        controller: 'MainCtrl'
      }).when('/product/add', {
        templateUrl: 'pages/product_add.html',
        controller: 'ProductCtrl'
      }).when('/product/edit/:id', {
        templateUrl: 'pages/product_edit.html',
        controller: 'ProductCtrl'
      }).when('/product/list', {
        templateUrl: 'pages/product_list.html',
        controller: 'ProductCtrl'
      }).when('/about', {
        templateUrl: 'pages/about.html',
        controller: 'MainCtrl'
      }).when('/exit', {
        template: " ",
        controller: 'ExitCtrl'
      }).otherwise({
        redirectTo: '/'
      });
    }
  ]);

  angApp.factory('User', [
    '$resource', '$cookies', function($resource, $cookies) {
      if (localStorage.getItem('api_url')) {
        url_api = localStorage.getItem('api_url');
      }
      return $resource(url_api + 'users/:id', {
        id: '@id'
      }, query);
    }
  ]);

  angApp.factory('Product', [
    '$resource', '$cookies', function($resource, $cookies) {
      if (localStorage.getItem('api_url')) {
        url_api = localStorage.getItem('api_url');
      }
      return $resource(url_api + 'products/:id', {
        id: '@id'
      }, query);
    }
  ]);

  angApp.controller('MainCtrl', [
    '$scope', '$rootScope', '$http', '$location', 'User', '$cookies', function($scope, $rootScope, $http, $location, User, $cookies) {
      var apiURL;
      $http.defaults.headers.common['X-Auth-Token'] = localStorage.getItem('token');
      $rootScope.token = localStorage.getItem('token');
      return apiURL = localStorage.getItem('url_api');
    }
  ]);

  angApp.controller('UserCtrl', [
    '$scope', '$http', '$location', '$routeParams', '$cookies', 'User', function($scope, $http, $location, $routeParams, $cookies, User) {
      if (localStorage.getItem('token') && ($location.path() === '/login' || $location.path() === '/register')) {
        $location.path('/');
      }
      if (localStorage.getItem('api_url')) {
        $scope.apiURL = $cookies.get('api_url');
      }
      if (localStorage.getItem('token')) {
        User.get({
          id: localStorage.getItem('id')
        }, function(data) {
          return $scope.formData = data;
        }, function(error) {
          return alert('Не вдається зробити запит до серверу. Перевірте параметри підключення!');
        });
      }
      $scope.submitFormEdit = function() {
        if ($scope.formData) {
          User.update({
            id: $scope.formData.id
          }, $scope.formData);
        }
        if ($scope.apiURL) {
          return localStorage.setItem('api_url', $scope.apiURL);
        }
      };
      $scope.submitFormRegister = function() {
        return User.create($scope.formData, function(data) {
          return $location.path('/login');
        });
      };
      return $scope.submitFormLogin = function() {
        return $http.post(url_api + 'users/login', $scope.formData, {}).then(function(data) {
          localStorage.setItem('token', data.data.api_token);
          localStorage.setItem('id', data.data.id);
          return $location.path('/');
        }, function(error) {
          return alert(alert(error.data.message));
        });
      };
    }
  ]);

  angApp.controller('ProductCtrl', [
    '$scope', '$http', '$location', '$cookies', '$routeParams', 'Product', function($scope, $http, $location, $cookies, $routeParams, Product) {
      if (!(localStorage.getItem('token'))) {
        $location.path('/');
      }
      if ($routeParams.id) {
        Product.get({
          id: $routeParams.id
        }, function(data) {
          return $scope.formData = data;
        });
      } else {
        Product.index({}, function(data) {
          return $scope.products = data;
        });
      }
      $scope.submitFormAddProduct = function() {
        return Product.create($scope.formData, function(data) {
          return $location.path('/product/list');
        });
      };
      $scope.submitFormRemoveProduct = function(product) {
        return Product.destroy({
          id: product.id
        }, function() {
          var index;
          index = $scope.products.indexOf(product);
          return $scope.products.splice(index, 1);
        });
      };
      return $scope.submitFormEditProduct = function() {
        return Product.update({
          id: $scope.formData.id
        }, $scope.formData, function(data) {
          return $location.path('/product/list');
        });
      };
    }
  ]);

  angApp.controller('ExitCtrl', [
    '$cookies', '$location', function($cookies, $location) {
      localStorage.removeItem('token');
      localStorage.removeItem('id');
      return $location.path('/');
    }
  ]);

}).call(this);
