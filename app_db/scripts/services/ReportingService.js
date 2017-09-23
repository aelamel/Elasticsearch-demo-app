app.service('ReportingService',function($q, esFactory, $location, SearchFactory, $http){
        var client = esFactory({
            host: $location.host() + ":9200"
        });

        /**
         * Given a term and an offset, load another round of 10 recipes.
         *
         * Returns a promise.
         */
        var search = function(term, offset, field, startDate, endDate){
            var deferred = $q.defer();
            if (!(term === undefined || term === "")) {
                var query = {
                    "bool": {
                        "must": [
                            {
                                "match_phrase": {
                                  "client_name": term
                                }
                            }
                        ],
                        "filter": [
                            { "range": { [field]: { "gte": startDate, "lte": endDate }}} 
                        ]
                    }
                };
                
                var aggs = {
                    "orders_over_day" : {
                        "date_histogram" : {
                            "field" : field,
                            "interval" : "day",
                            "format" : "yyyy-MM-dd"
                        }
                    },
                    "orders_over_month" : {
                        "date_histogram" : {
                            "field" : field,
                            "interval" : "month",
                            "format" : "MMMM"
                        }
                    },
                    "orders_over_year" : {
                        "date_histogram" : {
                            "field" : field,
                            "interval" : "year",
                            "format" : "yyyy"
                        }
                    }
                };
            }

            client.search({
                "index": 'company',
                "type": 'order',
                "body": {
                    "sort" : [
                        "_score",
                        { "created_at" : {"order" : "desc"} }
                    ],
                    "size": 10,
                    "from": (offset || 0) * 10,
                    "query": query,
                    "aggs" : aggs
                }
            }).then(function(result) {
                var ii = 0, hits_in, hits_out = [], total = result.hits.total, aggregations = result.aggregations;
                hits_in = (result.hits || {}).hits || [];
                for(;ii < hits_in.length; ii++){
                    hits_out.push(hits_in[ii]._source);
                }
                deferred.resolve([hits_out, total, aggregations]);
            }, deferred.reject);

            return deferred.promise;
        };

        var getSuggestions = function(term) {
            var deferred = $q.defer();
            var query = {
                "multi_match" : {
                    "query":      term,
                    "type":       "phrase_prefix",
                    "fields":     ["client_name"]
                }
            };

            client.search({
                "index": 'company',
                "type": 'order',
                "body": {
                    "size": 10,
                    "query": query
                }
            }).then(function(result) {
                var ii = 0, hits_in, hits_out = [], total = result.hits.total;
                hits_in = (result.hits || {}).hits || [];
                for(;ii < hits_in.length; ii++){
                    hits_out.push(hits_in[ii]._source);
                }
                deferred.resolve(hits_out);
            }, deferred.reject);

            return deferred.promise;
        }

        var clients = function () {
            return $http.get('http://localhost:8080/clients');
        }

        return {
            "search": search,
            "getSuggestions": getSuggestions,
            "clients": clients
        };
    }
);