app.controller('SearchCtrl', function ($scope, SearchService) {

    $scope.page = 0;
    $scope.orders = [];
    $scope.formSubmitted = false;    
    $scope.searchByTerm = function (page) {
        $scope.page = page;
        $scope.suggestions = [];
        SearchService.search($scope.searchTerm, $scope.page).then(function(response) {
            $scope.formSubmitted = true;
            if ($scope.page === 0) {
                $scope.orders = [];
            } 
            $scope.displayedOrders = response.data[0].data.length + $scope.orders.length;            
            $scope.orders = $scope.orders.concat(response.data[0].data);
            $scope.total = response.data[0].total;
        });
    };

    $scope.setFilter = function (type) {
        $scope.filter = type;
    };

    $scope.loadMore = function () {
        $scope.page++;
        $scope.searchByTerm($scope.page);
    }

    $scope.getSuggestions = function () {
        SearchService.getSuggestions($scope.searchTerm).then(function(response) {
            console.log(response);
            $scope.suggestions = response.data[0].data;
            $scope.showDropdown = true;
        });
    }

});
