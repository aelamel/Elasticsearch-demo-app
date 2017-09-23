/* global _:false; */
'use strict';
var app = angular.module('mySearchEngineApp', [
    'ngRoute',
    'highcharts-ng',
    'elasticsearch',
    '720kb.datepicker',
    'siyfion.sfTypeahead'
  ]);

 app.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl' 
      })
      .when('/reporting/:type', {
        templateUrl: 'views/reporting.html',
        controller: 'ReportingCtrl' 
      })
      .otherwise({
        redirectTo: '/'
      });
  });
