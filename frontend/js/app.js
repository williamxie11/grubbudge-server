// var demoApp = angular.module('demoApp', ['demoControllers']);

var grubApp = angular.module('grubApp', ['ngRoute', 'grubControllers', 'grubServices', 'ngLoadScript', '720kb.datepicker']);


grubApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/mealplan', {
    templateUrl: 'partials/mealplan.html',
    controller: 'MealPlanController'
  }).
  when('/secondview', {
    templateUrl: 'partials/secondview.html',
    controller: 'SecondController'
  }).
  when('/home', {
    templateUrl: 'partials/home.html',
    controller: 'HomeController'
  }).
  when('/list', {
    templateUrl: 'partials/list.html',
    controller: 'ListController'
  }).
  otherwise({
    redirectTo: '/home'
  });
}]); 