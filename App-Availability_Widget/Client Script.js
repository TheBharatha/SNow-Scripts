function($scope, $rootScope, spUtil, spModal) {
	setTimeout(function(){
		spUtil.update($scope)
	}, 10000);
	
	for (var x in $scope.data.dates) {
		var dateStr = moment($scope.data.dates[x]).format('ll').split(',')[0];
		var dateObj = {
			month: $scope.data.monthTranslations[dateStr.split(" ")[0]],
			day: parseInt(dateStr.split(" ")[1])
		}
		$scope.data.dates[x] = dateObj;
	}
	
	var c = this;
	
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
			widget: 'service_timeline_v2',
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
		}
		
		var outageId = $outage;
		spModal.open({
			widget: 'outage_details_v2',
			widgetInput: {
				outage:outageId
			},
			title: '<h3 style="margin-top: 10px;"><i class="fa fa-' + icon + '-circle text-' + text + '"></i> ' + $name + '</h3>',
			buttons: []
		})
	}
	
	$scope.$on("shown.bs.modal", function(e) {

	})
	
	$rootScope.$on("widgetRefresh", function(){
		c.server.update();
	});
	
}
