app.controller('SearchCtrl', function ($scope, SearchService) {

    $scope.page = 0;
    $scope.orders = [];
    $scope.searchByTerm = function (page) {
        $scope.page = page;
        $scope.suggestions = [];
        SearchService.search($scope.searchTerm, $scope.page, $scope.filter).then(function(response) {
            if ($scope.page === 0) {
                $scope.orders = [];
            } 
            $scope.displayedOrders = response[0].length + $scope.orders.length;            
            $scope.orders = $scope.orders.concat(response[0]);
            $scope.total = response[1]
            console.log(response);
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
            $scope.suggestions = response;
            $scope.showDropdown = true;
            console.log(response);
        });
    }

});
