function($scope, $rootScope, spUtil, spModal, $window) {

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

	c.blankOuts = function() {
		if (data.bCount > 0) {
			return true;
		} else {
			return false;
		}
	}

	c.showOuts = function(bOuts) {
		var urlStrO = 'https://comerica.service-now.com/nav_to.do?uri=cmdb_ci_outage_list.do?sysparm_query=';
		for (var sID=0; sID< bOuts.length; sID++) {
			urlStrO = urlStrO.concat("sys_id=").concat(bOuts[sID]);
			if (sID !== bOuts.length-1) {
				urlStrO = urlStrO.concat("^OR");
			}
		}
		$window.open(urlStrO, '_blank');
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

	//To open the Incident on a new tab
	c.openInc = function(incsysid) {
		$window.open('https://comerica.service-now.com/x_fru_inc_incident.do?sys_id='+incsysid, '_blank');
	}

	//To open the group of Incidents on new tab
	c.multInc = function(manyInc) {
		var urlStr = 'https://comerica.service-now.com/nav_to.do?uri=x_fru_inc_incident_list.do?sysparm_query=';
		for (var i=0; i< manyInc.length; i++) {
			urlStr = urlStr.concat("number=").concat(manyInc[i]);
			if (i !== manyInc.length-1) {
				urlStr = urlStr.concat("^OR");
			}
		}
		$window.open(urlStr, '_blank');
	}

	c.openOutage = function($event, type, $outage, $name){
		var icon = "";
		var text = "";

		if (type == "outage") {
			icon = "exclamation";
			text = "danger";
		} else if (type == "performance_degradation") {
			icon = "minus";
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
