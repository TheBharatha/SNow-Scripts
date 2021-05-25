function($scope, $rootScope, spUtil, spModal) {

	for (var x in $scope.data.dates) {
		var dateStr = moment($scope.data.dates[x]).format('ll').split(',')[0];
		var dateObj = {
			month: $scope.data.monthTranslations[dateStr.split(" ")[0]],
			day: parseInt(dateStr.split(" ")[1])
		}
		$scope.data.dates[x] = dateObj;
	}

	var c = this;
	$scope.showAppStatus = function(domValue,domName){
		c.data.domainName = domName;
		c.data.domainValue = domValue;
		c.server.update();
	}

	c.doClick = function($event, outage) {
		if (outage[0] == "detailsModal") {
			c.detailsModal($event, outage[2], outage[3]);
		} else if (outage[0] == "openOutage") {
			c.openOutage($event, outage[1], outage[2], outage[3])
		}
	}

	c.detailsModal = function($event, $service, $name){
		var serviceId = $service;
		spModal.open({
			widget: 'business_application_service_timeline',
			widgetInput: {
				service:serviceId
			},
			size: 'lg',
			title: $name,
			buttons: []
		})
	}

	c.openOutage = function($event, type, $outage, $name){
		var icon = "";
		var text = "";

		if (type == "outage") {
			icon = "minus";
			text = "danger";
		} else if (type == "performance_degradation") {
			icon = "exclamation";
			text = "warning";
		} else if (type == "planned") {
			icon = "info";
			text = "primary";
		} else if (type == "partial") {
			icon = "times";
			text = "circle";
		} else if (type == "multiple") {
			icon = "plus";
			text = "circle";
		}

		var outageId = $outage;
		spModal.open({
			widget: 'business_app_outage_details',
			widgetInput: {
				outage:outageId
			},
			title: '<h3 style="margin-top: 10px;"><i class="fa fa-' + icon + '-circle text-' + text + '"></i> ' + $name + '</h3>',
			buttons: []
		})
	}

	$scope.$on("shown.bs.modal", function(e) {})

	$rootScope.$on("widgetRefresh", function(){
		c.server.update();
	},10000,0);

}
