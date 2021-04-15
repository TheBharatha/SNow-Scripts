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

	$scope.showAppStatus = function(domValue){
		c.data.domainValue = domValue;
		c.server.update();
	}
}
