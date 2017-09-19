app.controller('ReportingCtrl', function ($scope, ReportingService, $route, $filter) {

    var field = 'created_at';
    var type = $route.current.params.type;
    switch(type) {
        case 'created' : 
            field = 'created_at';
            break;
        case 'delivered' :
            field = 'delivery_date';
            break;
    }
    $scope.page = 0;
    $scope.orders = [];
    $scope.clients = [];
    $scope.typeAheadOptions = {
        displayKey: 'nom'
    };
    ReportingService.clients().then(function(response) {
        
        // instantiate the bloodhound suggestion engine
        var clientsList = new Bloodhound({
            datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.nom); },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: response.data[0].data
        });

        console.log(response.data[0].data);
        $scope.clients = {
            displayKey: 'nom',
            source: clientsList.ttAdapter(),
            templates: {
            empty: [
                '<div class="tt-suggestion tt-empty-message">',
                'No results were found ...',
                '</div>'
            ].join('\n'),
            }
        };
    });

    $scope.reflow = function () {
        $scope.$broadcast('highchartsng.reflow');
    };

    $scope.search = function (page) {
        $scope.page = page;
        console.log($scope.searchTerm);
        console.log($scope.page);
        console.log(field);
        console.log($scope.startDate); 
        console.log($scope.endDate);
        ReportingService.search($scope.searchTerm.nom, $scope.page, field, $scope.startDate, $scope.endDate).then(function(response) {
            if ($scope.page === 0) {
                $scope.orders = [];
            } 
            $scope.displayedOrders = response[0].length + $scope.orders.length;            
            $scope.orders = $scope.orders.concat(response[0]);
            $scope.total = response[1];
            console.log(_.pluck(response[2].orders_over_day.buckets, 'doc_count'));
            $scope.chartConfigYear = $scope.drawChart($filter('capitalize')(type) + " Orders by year", response[2].orders_over_year.buckets);
            $scope.chartConfigMonth = $scope.drawChart($filter('capitalize')(type)  + " Orders by month", response[2].orders_over_month.buckets);
            $scope.chartConfigDay = $scope.drawChart($filter('capitalize')(type) + " Orders by day", response[2].orders_over_day.buckets);


            console.log(response);
        });
    };

    $scope.setFilter = function (type) {
        $scope.filter = type;
    };

    $scope.loadMore = function () {
        $scope.page++;
        $scope.search($scope.page);
    }

    $scope.getSuggestions = function () {
        SearchService.getSuggestions($scope.searchTerm).then(function(response) {
            $scope.suggestions = response;
            $scope.showDropdown = true;
            console.log(response);
        });
    }

    $scope.drawChart = function (title, data) {
        var chartSeries = [
    
            {"name": title, "data": _.pluck(data, 'doc_count'), type: "column", id: 's3'}
        
        ];

        var chart = {

            chart: {
            height: 500,
            width: 500,
            type: 'line'
            },
            plotOptions: {
                series: {
                    stacking: ''
                }
            },
            xAxis: {
                categories: _.pluck(data, 'key_as_string'),
                crosshair: true
            },
            series: chartSeries,
            title: {
            text: title
            }
        }
        return chart;
    }

});
