var grubControllers = angular.module('grubControllers', []);

grubControllers.controller('MealPlanController', ['$scope', 'CommonData'  , function($scope, CommonData) {
  $scope.data = "";
   $scope.displayText = ""

  $scope.setData = function(){
    CommonData.setData($scope.data);
    $scope.displayText = "Data set"

  };

}]);

grubControllers.controller('LoginController', ['$scope', '$rootScope', 'CommonData' , function($scope, $rootScope, CommonData) {
  $scope.data = "";
}]);

grubControllers.controller('RegisterController', ['$scope', '$rootScope', 'CommonData', function($scope, $rootScope, CommonData) {
  $scope.data = "";
}]);


grubControllers.controller('ListController',['$scope', '$rootScope','$http', 'HomeFactory' , function($scope, $rootScope,$http,  HomeFactory) {

    var myBudget = $rootScope.queryBudget;
    var myMealType = $rootScope.queryMealType;
    var category = $rootScope.queryCategory;
    var date = $rootScope.queryDate;

    console.log('price is '+myBudget+ ' mealType is '+myMealType+' category is '+category+' date is '+date);

    HomeFactory.getMealList(myBudget, myMealType, category).success(function(data){
          $scope.data = data.data;
        }).error(function(data){
          console.log('got an error');
        })

    $scope.selectRestaurant = function() {
          var restaurantID = this.restaurant._id;

          console.log(restaurantID);
    }
}]);

grubControllers.controller('HomeController', ['$scope' , '$rootScope', '$window', 'HomeFactory',function($scope, $rootScope, $window, HomeFactory) {

    /***** BUDGE SEARCH *****/
    $scope.budgeSearch = function () {
        var myBudget = $scope.asad;
        $rootScope.queryMealType = $scope.MealType;
        $rootScope.queryCategory = $scope.category;
        $rootScope.queryDate = $scope.date;

        // set price level
        if (myBudget <= 10)
          myBudget = 1;
        else if (myBudget <= 20)
          myBudget = 2;
        else if (myBudget <= 30)
          myBudget = 3;
        else
          myBudget = 4;

        $rootScope.queryBudget = myBudget;
    };

  $scope.url = $window.sessionStorage.baseurl;

  $scope.setUrl = function(){
    $window.sessionStorage.baseurl = $scope.url;
    $scope.displayText = "URL set";


  };

}]);
