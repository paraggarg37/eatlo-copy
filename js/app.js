var animation_delay = 750;
var company_id = 6896;
var demongoon_host = "http://api240.done.to";
//var demongoon_host = "http://10.0.0.184:5001";
var development_mode = false;
var done_host = "http://api240.done.to";
//var done_host = "http://10.0.0.26:5000";
var only_for_app_product = [164981,164982,164983,164984];
var done_host_parameters = {
    timeout: 10000
};
var page_active = "/";

var eatlo = angular.module('eatlo', ["ngAnimate","ui.router","eatlo.controllers","eatlo.services"])
eatlo
    .config(function($stateProvider, $urlRouterProvider) {

        $stateProvider
        .state('app', {
            url: "/",
            templateUrl: "partials/default.html",
            controller:"mainCtrl",
            abstract:true
        })
        .state('app.menu',{
            url:"menu",
            controller:"menuCtrl",
            templateUrl:"partials/menu.html"

        })
        .state('app.outlets',{
                url:"outlets",
                controller:"outletsCtrl",
                templateUrl:"partials/outlets.html"

         })


        $urlRouterProvider.otherwise('/menu');
    })
    .run(['$rootScope', '$state',function ($rootScope, $state) {


    }])
