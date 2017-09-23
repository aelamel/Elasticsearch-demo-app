app.service('SearchService',function($http){
        
        var search = function(term, page){
            return $http.get('http://localhost:8080/search/orders/' + term + '/' + page);

        };

        var getSuggestions = function(term) {
            return $http.get('http://localhost:8080/orders/suggestions/' + term);
        }


        return {
            "search": search,
            "getSuggestions": getSuggestions
        };
    }
);