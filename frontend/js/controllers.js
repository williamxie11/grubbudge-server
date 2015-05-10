var grubControllers = angular.module('grubControllers', []);

grubControllers.controller('MealPlanController', ['$scope', 'CommonData'  , function($scope, CommonData) {
  $scope.data = "";
   $scope.displayText = ""

  $scope.setData = function(){
    CommonData.setData($scope.data);
    $scope.displayText = "Data set"

  }; 

}]);

grubControllers.controller('SecondController', ['$scope', 'CommonData' , function($scope, CommonData) {
  $scope.data = "";

  $scope.getData = function(){
    $scope.data = CommonData.getData();

  };

}]);


grubControllers.controller('ListController', ['$scope', '$http', 'HomeFactory' , function($scope, $http,  HomeFactory) {
    //console.log('INSIDE LIST CONTROLLER');
    //$scope.queryData = HomeFactory.get();
    //console.log($scope.queryData);
    var myBudget = 1;
    var myMealType = 0;
    var category = 0;

    var name;
    var imageURL;
    var rating;
    var ratingURL;

    HomeFactory.getMealList(myBudget, myMealType, category).success(function(data){
          //console.log(data);
          $scope.data = data.data;

          $scope.name = $scope.data[0].name;
          $scope.imageURL = $scope.data[0].imageURL;
          $scope.rating = $scope.data[0].rating;
          $('.star').raty({readOnly:true, score: $scope.rating});
          $scope.ratingURL = $scope.data[0].ratingURL;
          $scope.address = $scope.data[0].address;
          $scope.categories = $scope.data[0].categories;
        })

    $scope.selectRestaurant = function() {
          console.log(this.restaurant);
    }


}]);

grubControllers.controller('HomeController', ['$scope' , '$window', 'HomeFactory',function($scope, $window, HomeFactory) {

    /***** BUDGE SEARCH *****/
    $scope.budgeSearch = function () {
        //console.log('Someone made a budgy search query');
        var myBudget = $scope.asad;
        var myMealType = $scope.MealType;
        var category = $scope.category;

        if(myBudget <= 10)
          myBudget = 1;
        else if(myBudget <= 20)
          myBudget = 2;
        else if (myBudget <= 30)
          myBudget = 3;
        else
          myBudget = 4;

        //myBudget = $('#budget').val();
        //console.log('my price is ' + myBudget);
        //console.log(myMealType);
        //console.log('my category is' + category);


        HomeFactory.getMealList(myBudget, myMealType, category).success(function(data){
          //console.log(data);
          $scope.data = data.data;
          console.log($scope.data);
          //HomeFactory.set($scope.data);
          //console.log(HomeFactory.getQueryVal());
        })

        
          // $scope.Shared = Shared;
          // $scope.Shared.arr = $scope.data;
    };

  $scope.url = $window.sessionStorage.baseurl;

  $scope.setUrl = function(){
    $window.sessionStorage.baseurl = $scope.url;
    $scope.displayText = "URL set";


  };

}]);


