app.service('SearchService',function($q, esFactory, $location, SearchFactory){
        var client = esFactory({
            host: $location.host() + ":9200"
        });

        /**
         * Given a term and an offset, load another round of 10 recipes.
         *
         * Returns a promise.
         */
        var search = function(term, offset, filter){
            var deferred = $q.defer();
            if (term === undefined|| term === "") {
                var query = {
                    "match_all" : {}
                };
            } else {
                var query = {
                    "query_string": {
                        "query" : term
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
                    "query": query
                }
            }).then(function(result) {
                var ii = 0, hits_in, hits_out = [], total = result.hits.total;
                hits_in = (result.hits || {}).hits || [];
                for(;ii < hits_in.length; ii++){
                    hits_out.push(hits_in[ii]._source);
                }
                deferred.resolve([hits_out, total]);
            }, deferred.reject);

            return deferred.promise;
        };

        var getSuggestions = function(term) {
            var deferred = $q.defer();
            var query = {
                "multi_match" : {
                    "query":      term,
                    "type":       "phrase_prefix",
                    "fields":     [ "code", "description", "client_name", "client_country" ]
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


        return {
            "search": search,
            "getSuggestions": getSuggestions
        };
    }
);