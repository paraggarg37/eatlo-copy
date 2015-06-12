/**
 * Created by paraggarg on 12/06/15.
 */
angular.module('eatlo.services', [])
    .service('dataService', ['$http', function ($http) {


        this.getMenu = function(id){
            return $http.get(demongoon_host+"/menu/"+id, {
                cache: true,
                timeout: 7500
            })
        }

        this.getCustomisations = function(oid,pid){
            return $http.get(demongoon_host + "/customizations/" + oid + "/" + pid)
        }

        this.getProxySubAreas = function(latitude, longitude){

            return $http.get("proxy_subareas.php?latitude=" + latitude + "&longitude=" + longitude)
        }

        this.postdoneOutletsBySubArea = function (request) {
            $http.post(done_host + "/done-nearest-outlets-by-subarea", request, done_host_parameters)
        }


    }])
