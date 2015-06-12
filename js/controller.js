/**
 * Created by paraggarg on 12/06/15.
 */
angular.module('eatlo.controllers', ["ngCookies"]).controller('mainCtrl', [
    '$scope', '$state', '$rootScope', '$location',
    function ($scope, $state, $rootScope, $location)
    {
        $scope.showOutlet = false;
        $scope.outlet = null;
        $scope.pages = [
            {
                label: "Choose Location",
                faclass: "fa-home",
                route: "/outlets"}, {
                label: "Choose Dishes",
                faclass: "fa-bars",
                route: "/menu"}, {
                label: "Place Order",
                faclass: "fa-shopping-cart",
                route: "/checkout"}, {
                label: "Order History",
                faclass: "fa-history",
                route: "/orderhistory"},
            {
                label: "Contact Us",
                faclass: "fa-phone",
                route: "/contactus"}
        ];
        $scope.page_active = "/menu";
        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams)
        {
            $scope.page_active = $location.path();
            if ($location.path() == "/menu")
            {
                $scope.showOutlet = true;
            }
            else
            {
                $scope.showOutlet = false;
            }
        })}
]).controller("menuCtrl", ["$state", "dataService", "$location", "$scope",
    function ($state, dataService, $location, $scope)
    {
        $("#share-links").css('display', 'block');
        $("#share-links-withface").css('display', 'none');
        if (localStorage.getItem("outlet") === null)
        {
            $state.go("app.outlets");
        }
        else
        {
            $scope.outlet = JSON.parse(localStorage.getItem("outlet"));
            $scope.$parent.showOutlet = true;
            $scope.$parent.outlet = $scope.outlet
            $scope.outlet_id = $scope.outlet.id;
            $scope.all_categories = [];
            $scope.categories = [];
            $scope.all_products = [];
            $scope.products = [];
            $scope.Old_products = [];
            $scope.item_count = 0;
            $scope.cart_total = 0;
            $scope.attributes = [];
            $scope.cart_items = [];
            $scope.ntok = "";
            $scope.selected_attribute = "All";
            var temp_cart = [];
            if (localStorage.getItem("cart") !== null)
            {
                $scope.cart_items = JSON.parse(localStorage.getItem("cart"));
            }
            $scope.choose_filter = function (attribute_name)
            {
                if (attribute_name === "All")
                {
                    $scope.selected_attribute = "All";
                    $scope.product_search_keyword = null;
                }
                else if (attribute_name === "Veg")
                {
                    $scope.selected_attribute = 115;
                    $scope.product_search_keyword = 115;
                }
                else
                {
                    $scope.selected_attribute = "Non-Veg";
                    $scope.product_search_keyword = "Non-Veg";
                }
                console.log($scope.product_search_keyword);
            };
            dataService.getMenu($scope.outlet_id).success(function (
                response)
            {

                var all_category =
                {
                    id: null,
                    parent_category_id: null,
                    name: "All",
                    description: "Showing all products across all categories served by this outlet.",
                    photo_url: "img/logo.png",
                    selection_min: 1,
                    selection_max: 1,
                    display: "0",
                    sr: -1
                };
                $scope.all_categories = response.categories;
                $scope.all_products = response.products;
                $scope.old_products = response.old_products;
                $scope.attribute_groups = response.attribute_groups;
                for (var i = 0; i < $scope.all_categories.length; i++)
                {
                    if ($scope.all_categories[i].display === "0" && $scope.all_categories[i].id !== 14871 && $scope.all_categories[i].id !== 14870)
                    {
                        $scope.categories.push($scope.all_categories[
                            i]);
                    }
                    else if ($scope.all_categories[i].id === 14870)
                    {
                        if (moment().weekday() === 5 || moment().weekday() === 6 || moment().weekday() === 0)
                        {
                            $scope.categories.push($scope.all_categories[
                                i]);
                        }
                    }
                }
                $scope.categories.push(all_category);
                $scope.selected_category = all_category;
                for (var i = 0; i < $scope.all_products.length; i++)
                {
                    $scope.all_products[i].quantity = 1;
                    if ($scope.all_products[i].parent_outlet_product_id === null && $scope.all_products[i].category_id !== 14871 && $scope.all_products[i].category_id !== 14870 && only_for_app_product.indexOf(
                            $scope.all_products[i].id) === -1)
                    {
                        $scope.products.push($scope.all_products[
                            i]);
                    }
                    else if ($scope.all_products[i].category_id === 14870)
                    {
                        if (moment().weekday() === 5 || moment().weekday() === 6 || moment().weekday() === 0)
                        {
                            $scope.products.push($scope.all_products[
                                i]);
                        }
                    }
                    angular.forEach($scope.all_products[i].attributes, function (attribute)
                    {
                        switch (attribute.name)
                        {
                            case "Veg":
                                $scope.all_products[i].attribute_bg = "img/veg.png";
                                break;
                            case "Non-Veg":
                                $scope.all_products[i].attribute_bg = "img/non-veg.png";
                                break;
                            case "Jain":
                                $scope.all_products[i].attribute_bg = "img/jain.png";
                                break;
                        }
                    });
                    if ($scope.cart_items.length !== 0)
                    {
                        angular.forEach($scope.cart_items, function (cart_item)
                        {
                            if ($scope.all_products[i].id === cart_item.id)
                            {
                                temp_cart.push(
                                    cart_item);
                            }
                        });
                    }
                }
                if ($scope.cart_items.length !== 0)
                {
                    localStorage.removeItem("cart");
                    $scope.cart_items = [];
                    $scope.cart_items = temp_cart;
                    localStorage.setItem("cart", JSON.stringify(
                        $scope.cart_items));
                }
            }).error(function ()
            {
                create_alert(1, "It's taking longer than expected. Retry?", 3);
            });
            $scope.change_category = function (category)
            {
                $scope.selected_category = category;
                $scope.product_search_keyword = null;
            };
            $scope.get_customizations = function (product)
            {
                console.log(product);
                $scope.selected_product = angular.copy(product);
                $scope.selected_product.total_price = $scope.selected_product.price;
                $scope.selected_product.customization = [];
                if (product.parent_product)
                {
                    dataService.getCustomisations($scope.outlet_id, product.outlet_product_id).success(

                        function (response)
                        {

                            $scope.selected_product.all_customizations =
                                response;
                            console.log($scope.selected_product.all_customizations);
                            $scope.active_tab_id = response[0].id;
                            $("#customization-modal").foundation("reveal", "open");
                        });
                }
                else
                {
                    $scope.add_to_cart($scope.selected_product);
                }
            };
            $scope.process_customizations = function ()
            {
                var customizations = [];
                var customization_price = 0;
                $("#customization-modal input:checked").each(

                    function ()
                    {
                        customizations.push($(this).data("product"));
                        customization_price += $(this).data("product").price;
                    });
                var numberregex = new RegExp(/\d/);
                if (!numberregex.test($scope.selected_product.quantity))
                {
                    $scope.selected_product.quantity = 1;
                }
                $scope.selected_product.customization =
                    customizations;
                $scope.selected_product.price = $scope.selected_product.price + customization_price;
                $scope.selected_product.total_price = $scope.selected_product.price * $scope.selected_product.quantity;
                $scope.add_to_cart($scope.selected_product);
                //                $("#customization-modal").foundation("reveal", "close");
            };
            $scope.add_to_cart = function (product)
            {
                var duplicate = false;
                var count_customization = 0;
                var selection_min = 0;
                var selection_max = 0;
                var isvalid_customizations = [];
                var isvalid = true;
                if (product.all_customizations !== undefined)
                {
                    console.log(product.all_customizations.length);
                    for (var j = 0; j < product.all_customizations.length; j++)
                    {
                        if (product.all_customizations !== undefined)
                        {
                            selection_min = product.all_customizations[
                                j].selection_min;
                            selection_max = product.all_customizations[
                                j].selection_max;
                            count_customization = 0;
                            if (product.customization !== undefined)
                            {
                                count_customization = 0;
                                for (l = 0; l < product.customization.length; l++)
                                {
                                    console.log(product.customization[
                                        l]);
                                    console.log(product.all_customizations[
                                        j].id);
                                    if (product.customization[l].category_id === product.all_customizations[
                                            j].id)
                                    {
                                        count_customization =
                                            count_customization + 1;
                                    }
                                }
                                //
                            }
                            else
                            {
                                count_customization = 0;
                            }
                            if (count_customization >= selection_min && count_customization <= selection_max)
                            {
                                isvalid_customizations.push(true);
                            }
                            else
                            {
                                isvalid_customizations.push(false);
                            }
                            //                            console.log(count_customization +","+ selection_min +","+selection_max);
                        }
                    }
                }
                else
                {
                    isvalid_customizations.push(true);
                }
                for (var k = 0; k < isvalid_customizations.length; k++)
                {
                    if (isvalid_customizations[k] === true)
                    {
                        isvalid = true;
                    }
                    else
                    {
                        isvalid = false;
                        continue;
                    }
                }
                //                    if((count_customization === 0) ||(count_customization >= selection_min && count_customization <= selection_max))
                if (isvalid)
                {
                    for (var i = 0; i < $scope.cart_items.length; i++)
                    {
                        // Copy original quantity value
                        var qty = $scope.cart_items[i].quantity;
                        // Set values similar to the product to be added
                        $scope.cart_items[i].quantity = product.quantity;
                        $scope.cart_items[i].total_price = $scope.cart_items[
                            i].quantity * $scope.cart_items[i].price;
                        // Compare
                        if (JSON.stringify(angular.copy(product)) === JSON.stringify(angular.copy($scope.cart_items[
                                i])))
                        {
                            duplicate = true;
                            $scope.cart_items[i].quantity = qty + product.quantity;
                            $scope.cart_items[i].total_price =
                                $scope.cart_items[i].quantity * $scope.cart_items[i].price;
                            break;
                        }
                        else
                        {
                            $scope.cart_items[i].quantity = qty;
                            $scope.cart_items[i].total_price =
                                $scope.cart_items[i].quantity * $scope.cart_items[i].price;
                        }
                    }
                    if (!duplicate)
                    {
                        //                        console.log($scope.ntok);
                        //                        product.comments = $scope.ntok;
                        $scope.cart_items.push(angular.copy(product));
                    }
                    //                    create_alert(2, product.name + " added!", 3);
                    $("#customization-modal").foundation("reveal", "close");
                }
                else
                {
                    create_alert(1, "Kindly select any " + selection_min + " items", 3);
                }
            };
            $scope.change_outlet = function ()
            {
                $location.url("outlets");
            };
            $scope.change_active_tab = function (tab_id)
            {
                if ($scope.active_tab_id === tab_id)
                {
                    $scope.active_tab_id = 0;
                }
                else
                {
                    $scope.active_tab_id = tab_id;
                }
            };
            $scope.edit_quantity = function (delta, product)
            {
                if (delta === -1 && product.quantity > 1)
                {
                    product.quantity--;
                }
                else if (delta === 1)
                {
                    product.quantity++;
                }
                product.total_price = product.quantity * product.price;
            };
            $scope.remove_cart_item = function (index)
            {
                $scope.cart_items.splice(index, 1);
            };
            $scope.$watch("cart_items", function ()
            {
                $scope.item_count = 0;
                $scope.cart_total = 0;
                angular.forEach($scope.cart_items, function (
                    item)
                {
                    $scope.cart_total += item.total_price;
                    $scope.item_count += item.quantity;
                });
                localStorage.setItem("cart", JSON.stringify(
                    $scope.cart_items));
            }, true);
            $scope.$watch("selected_category", function ()
            {
                setTimeout(function ()
                {
                    $("#category-image").height($("#category-hero").height() + "px");
                }, 100);
            });
            $scope.checkout = function ()
            {
                $location.url("checkout");
            };
        }
        //        $route.reload();
    }
]).controller("outletsCtrl", ["$http", "$location", "$scope", "dataService",
    function ($http, $location, $scope, dataService)
    {
        //        $route.reload();
        $("#share-links").css('display', 'block');
        $("#share-links-withface").css('display', 'none'); /* Scope variables */
        $scope.display_subarea_suggestions = false; // Used to hide subarea suggestions on making a selection
        $scope.outlets = []; // Stores outlets
        $scope.outlets_timings = []; // Stores outlets Timing
        $scope.selected_subarea =
        {
            subarea_id: null,
            subarea_name: null,
            area_id: null,
            area_name: null,
            city_id: null,
            city_name: null
        }; // Stores selected subarea details
        $scope.search_keyword = ""; // Stores search keyword / selected subarea name
        $scope.subareas = []; // Stores subareas
        /* Function to get closest subarea based on co-ordinates */
        $scope.api_closest_subarea = function (latitude, longitude)
        {
            // Call web-service
            dataService.getProxySubAreas(latitude, longitude).success(

                function (response)
                {

                    if (response.response.numFound < 1)
                    {
                        // ... alert
                        create_alert(1, "Uh oh. We're not familiar with your area yet.", 3);
                    }
                    // ... if results are obtained
                    else
                    {
                        // ... make subarea object of first result (assuming that result is sorted by increasing distance) and get outlets serving this subarea
                        $scope.set_subarea(response.response.docs[
                            0]);
                    }
                });
        }; /* Function to set subarea in scope and localStorage and get outlets serving this subarea */
        $scope.set_subarea = function (subarea)
        {
            // Hide subarea suggestions and reset opacity of outlets
            $scope.display_subarea_suggestions = false;
            $(".outlet-container").animate(
                {
                    "opacity": "1"
                });
            // Update contents of search box
            $scope.search_keyword = subarea.subarea_name;
            // Save subarea in scope
            $scope.selected_subarea =
            {
                subarea_id: subarea.id,
                subarea_name: subarea.subarea_name,
                area_id: subarea.area_id,
                area_name: subarea.area_name,
                city_id: subarea.city_id,
                city_name: subarea.city_name
            };
            // Save subarea in localStorage
            localStorage.setItem("subarea", JSON.stringify($scope.selected_subarea));
            // Alert progress
            //            create_alert(2, "Looking for outlets serving " + $scope.selected_subarea.subarea_name + ".", false);
            // Get outlets based on subarea
            $scope.api_nearest_outlets_by_subarea();
        }; /* Function to get outlets serving a subarea */
        $scope.api_nearest_outlets_by_subarea = function ()
        {
            // Request object
            var request =
            {
                "company_id": company_id,
                "subarea_id": $scope.selected_subarea.subarea_id,
                "service_type": "food"
            };
            // Call web-service
            dataService.postdoneOutletsBySubArea(request).success(

                function (response)
                {

                    // ... if no outlet(s) found
                    if (response.responseCode !== 0)
                    {
                        $scope.outlets = [];
                        $scope.outlets_timings = [];
                        create_alert(1, "No outlets serving " + $scope.selected_subarea.subarea_name + ".", 3);
                    }
                    // ... if outlet(s) found
                    else
                    {
                        $scope.outlets = response.data.outlets;
                        $scope.outlets_timings = response.data.outlet_timing;
                        console.log($scope.outlets_timings);
                        //                    create_alert(2, "Let's choose an outlet to begin.", 3);
                    }
                }).error(function ()
                {
                    create_alert(1, "It's taking longer than expected. Retry?", 3);
                });
        }; /* Function to get subareas serviced by company */
        $scope.api_company_subarea = function ()
        {
            // If two or more characters have been entered
            if ($scope.search_keyword.length >= 2)
            {
                // ... call web-service
                $http.get("proxy_company_subareas.php?company_id=" + company_id + "&keyword=" + $scope.search_keyword).success(function (response)
                {

                    // ... if no subarea(s) found
                    if (response.response.docs.length < 1)
                    {
                        $scope.subareas = [];
                        $scope.display_subarea_suggestions =
                            false;
                        $(".outlet-container").animate(
                            {
                                "opacity": "1"
                            });
                    }
                    // ... if subarea(s) found
                    else
                    {
                        $scope.subareas = response.response.docs;
                        $scope.display_subarea_suggestions =
                            true;
                        $(".outlet-container").animate(
                            {
                                "opacity": "0.5"
                            });
                    }
                });
            }
            // If less than 2 characters have been entered
            else
            {
                $scope.subareas = [];
                $scope.display_subarea_suggestions = false;
                $(".outlet-container").animate(
                    {
                        "opacity": "1"
                    });
            }
        }; /* Function to get outlets of a company */
        $scope.api_outlets_by_company = function ()
        {
            // Unset selected subarea in scope
            $scope.selected_subarea =
            {
                subarea_id: null,
                subarea_name: null,
                area_id: null,
                area_name: null,
                city_id: null,
                city_name: null
            };
            // Unset selected subarea in localStorage
            if (localStorage.getItem("subarea") !== null)
            {
                localStorage.removeItem("subarea");
            }
            // Update contents of the search box
            $scope.search_keyword = "";
            // Request object
            var request =
            {
                "company_id": company_id,
                "outlet_last_updated_timestamp": 0,
                "ot_last_updated_timestamp": 0,
                "oa_last_updated_timestamp": 0,
                "oam_last_updated_timestamp": 0,
                "oag_last_updated_timestamp": 0,
                "offer_last_updated_timestamp": 0,
                "oom_last_updated_timestamp": 0
            };
            $("#loader_popup").show();
            $http.post(done_host + "/done-outlets-by-company", request, done_host_parameters).success(function (
                response)
            {
                //                create_alert(2, "OK!", 3);
                $("#loader_popup").hide();

                $scope.outlets = response.data.outlets;
                $scope.outlets_timings = response.data.outlet_timing;
                //                console.log($scope.outlets_timings);
            }).error(function ()
            {
                $("#loader_popup").hide();
                create_alert(1, "It's taking longer than expected. Retry?", 3);
            });
        }; /* Function to get HTML5 Geolocation */
        $scope.get_geolocation = function ()
        {
            // If Geolocation is supported
            if (navigator.geolocation)
            {
                create_alert(2, "Locating you...", false);
                navigator.geolocation.getCurrentPosition(function (
                    result)
                {
                    $scope.api_closest_subarea(result.coords.latitude, result.coords.longitude);
                }, function (error)
                {
                    switch (error.code)
                    {
                        case 1:
                            create_alert(1, "Could not get permission to access your location.", 3);
                            break;
                        case 2:
                            create_alert(1, "Bad connectivity. Try later, maybe?", 3);
                            break;
                        case 3:
                            create_alert(1, "It's taking longer than expected. Retry?", 3);
                            break;
                        default:
                            create_alert(1, "We ran into some error. Try searching for your area?", 3);
                    }
                });
            }
            // If Geolocation is not supported
            else
            {
                create_alert(1, "Uh oh. Geolocation is not supported by your browser. Try searching for your area?", 5);
            }
        }; /* Function to view menu once required details are obtained */
        $scope.view_menu = function (outlet)
        {
            // If no outlet is saved
            //            console.log(moment().fromNow());
            //            console.log(outlet);
            var Outlet_day = "";
            var start_time = "";
            var duration = "";
            var now = moment();
            var day = now.day() + 1;
            if (day === 0)
            {
                day = 7;
            }
            for (var i = 0; i < $scope.outlets_timings.length; i++)
            {
                if (outlet.id === $scope.outlets_timings[i].outlet_id && day === $scope.outlets_timings[i].day_of_week)
                {
                    start_time = $scope.outlets_timings[i].open_time;
                    duration = $scope.outlets_timings[i].duration;
                    Outlet_day = $scope.outlets_timings[i].day_of_week;
                    //                    console.log($scope.outlets_timings[i].day_of_week);
                }
            }
            console.log(start_time);
            console.log(Outlet_day);
            //            console.log($scope.outlets_timings);
            if ($scope.validate_storeTime(start_time, duration, Outlet_day))
            {
                if (localStorage.getItem("outlet") === null)
                {
                    // Save outlet
                    localStorage.setItem("outlet", JSON.stringify(
                        angular.copy(outlet)));
                    // Load menu
                    $location.url("menu");
                }
                // If outlet exists
                else
                {
                    // If user selects a different outlet
                    if (JSON.parse(localStorage.getItem("outlet")).id !== outlet.id)
                    {
                        // If cart is not empty
                        if (localStorage.getItem("cart") !== null && JSON.parse(localStorage.getItem("cart")).length !== 0)
                        {
                            // If user consents
                            if (confirm("Your cart will be emptied on changing the outlet. Continue?"))
                            {
                                localStorage.setItem("outlet", JSON.stringify(angular.copy(
                                    outlet)));
                                localStorage.removeItem("cart");
                                $location.url("menu");
                            }
                            else
                            {
                                // Do nothing
                            }
                        }
                        else
                        {
                            localStorage.setItem("outlet", JSON.stringify(
                                angular.copy(outlet)));
                            $location.url("menu");
                        }
                    }
                    else
                    {
                        $location.url("menu");
                    }
                }
            }
            else
            {
                create_alert(1, "Sorry! We are closed right now. Please check back later.", 5);
            }
        };
        $scope.validate_storeTime = function (start_time, duration, Outlet_day)
        {
            //                duration = "11:00:00";
            //                if(start_time === "00:01:00"){
            //                   start_time =  "12:01:00";
            //                }
            var s_time = moment(start_time, "HH:mm:ss");
            var end_duration = moment(duration, "HH:mm:ss");
            var currentdate = moment();
            //                currentdate = moment("00:00:01","HH:mm:ss");
            var end_time = moment(s_time._d).add(end_duration, 'hours');
            if (currentdate >= moment(s_time._d) && currentdate <= moment(end_time._d))
            {
                return true;
                console.log("You can place the order");
            }
            else
            {
                return false;
                console.log("You can not place the order");
            }
        };
        //        }
        /* Load relevant outlets if subarea is known */
        if (localStorage.getItem("subarea") !== null)
        {
            $scope.selected_subarea = JSON.parse(localStorage.getItem("subarea"));
            $scope.api_nearest_outlets_by_subarea();
        }
        $scope.api_outlets_by_company(); /* Re-initialize Foundation */
        $(document).ready(function ()
        {
            $(document).foundation();
        });}
]);