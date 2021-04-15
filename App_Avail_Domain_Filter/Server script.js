(function() {

	data.monthTranslations = {
		'Jan': gs.getMessage("Jan"),
		'Feb': gs.getMessage("Feb"),
		'Mar': gs.getMessage("Mar"),
		'Apr': gs.getMessage("Apr"),
		'May': gs.getMessage("May"),
		'Jun': gs.getMessage("Jun"),
		'Jul': gs.getMessage("Jul"),
		'Aug': gs.getMessage("Aug"),
		'Sep': gs.getMessage("Sep"),
		'Oct': gs.getMessage("Oct"),
		'Nov': gs.getMessage("Nov"),
		'Dec': gs.getMessage("Dec")
	};

	data.dates = [];
	for (var j = 7; j > 0; j--) {
		var d = new GlideDate();
		d.subtract(1000 * 3600 * 24 * (j - 1));
		data.dates.push(d.getDisplayValueInternal());
	}

	//Domain filter buttons block start
	data.appNamesValues = {"appsNvalues" : []};
	data.queryModulate = "x_fru_foundation_application.u_cpp=yes^sys_class_name=cmdb_ci_service^u_imc_status=Active^x_fru_foundation_service_towerANYTHING";
	data.categories = [];

	var allDomains = new GlideRecord("sys_choice");
	allDomains.addEncodedQuery('name=cmdb_ci_service^element=x_fru_foundation_service_tower^language=en^inactive=false^labelNOT LIKEarchitecture^labelNOT LIKEpayments, deposits, trust^label!=business partner^label!=credit and lending^label!=Enterprise Data and Analytics^label!=Delivery Channels and Contact Management^label!=Corporate and Enterprise Risk^label!=Strategy, Contact Center Platform and CoE^label!=Core Payments Development and Delivery^label!=Deposits Platform and Processing^label!=Information Security and Technology Risk^label!=Electronic Payments and Strategy Development');
	allDomains.query();
	var av = {};
	while(allDomains.next()) {
		av.appName = allDomains.getValue('label');
		av.appValue = allDomains.getValue('value');
		data.appNamesValues.appsNvalues.push(av);
		av = {};
	}
	av.appName = "All Domains";
	av.appValue = "ANYTHING";
	data.appNamesValues.appsNvalues.push(av);
	data.appNamesValues.appsNvalues.sort(function(a,b){
		if(a.appName > b.appName) {
			return 1;
		} else {
			return -1;
		}
	});

	if(input) {
		if(input.domainValue == "ANYTHING"){
			data.queryModulate = data.queryModulate;
		} else {
			data.queryModulate = "x_fru_foundation_application.u_cpp=yes^sys_class_name=cmdb_ci_service^u_imc_status=Active^x_fru_foundation_service_tower="+input.domainValue;
		}
	}

	//Domain filter buttons ends
	
	var svs = new GlideRecord("cmdb_ci_service");
	var currentCategory = "-";
	var catIndex = -1;
	svs.addEncodedQuery(data.queryModulate);
	svs.setLimit(options.number_of_services || 250);
	svs.orderByDesc("category");
	svs.orderBy("busines_criticality");
	svs.orderBy("name");
	svs.query();
	svs.addEncodedQuery(data.queryModulate);
	svs.setLimit(options.number_of_services || 250);
	svs.orderByDesc("category");
	svs.orderBy("busines_criticality");
	svs.orderBy("name");
	svs.query();
	while (svs.next()) {
		var cat = svs.getValue("category");
		if (cat != currentCategory) {
			catIndex++;
			currentCategory = cat;
			data.categories[catIndex] = {};
			data.categories[catIndex].name = cat;
			data.categories[catIndex].label = svs.getDisplayValue("category");
			if (data.categories[catIndex].label == "")
				data.categories[catIndex].label = gs.getMessage("Business Service");
			data.categories[catIndex].services = [];
		}
		var svc = {};
		svc.sys_id = svs.getUniqueValue();
		svc.name = svs.getDisplayValue();
		svc.safeName = GlideStringUtil.escapeHTML(svc.name);
		svc.curOutages = getOuts(svc.sys_id);

		var outs = [];
		for (var i = 0; i <= 6; i++) {
			var out = new GlideAggregate("cmdb_ci_outage");
			out.addQuery("u_business_service.sys_id", svs.getUniqueValue());
			out.addQuery("begin", "<=", gs.daysAgoEnd(i));
			out.addQuery("end", ">=", gs.daysAgoStart(i)).addOrCondition("end", "=", "NULL");
			out.addAggregate('COUNT', 'type');
			out.query();
			var svcOutageDay = {};
			svcOutageDay.count = 0;

			while (out.next()) {
				var type = out.type;
				var typeCount = out.getAggregate('COUNT', 'type');
				svcOutageDay[type] = typeCount;
				svcOutageDay.count += typeCount;
			}
			svcOutageDay.icon = "fa-check-circle";
			svcOutageDay.msg = gs.getMessage("{0} - no outage", svc.safeName);
			svcOutageDay.link = ["fine"];
			if (svcOutageDay.count > 1) {
				svcOutageDay.icon = "fa-plus-circle";
				svcOutageDay.msg = gs.getMessage("{0} - multiple issues", svc.safeName);
				svcOutageDay.link = ["detailsModal", "", svc.sys_id, svc.safeName];
			} else if (svcOutageDay.outage > 0) {
				svcOutageDay.icon = "fa-exclamation-circle";
				svcOutageDay.msg = gs.getMessage("{0} - outage", svc.safeName);
				svcOutageDay.link = ["openOutage", "outage", getSpecificOutage(svc.sys_id, i), svc.safeName];
			} else if (svcOutageDay.performance_degradation > 0) {
				svcOutageDay.icon = "fa-minus-circle";
				svcOutageDay.msg = gs.getMessage("{0} - degradation of service", svc.safeName);
				svcOutageDay.link = ["openOutage", "performance_degradation", getSpecificOutage(svc.sys_id, i), svc.safeName];
			} else if (svcOutageDay.planned > 0) {
				svcOutageDay.icon = "fa-info-circle";
				svcOutageDay.msg = gs.getMessage("{0} - planned outage", svc.safeName);
				svcOutageDay.link = ["openOutage", "planned", getSpecificOutage(svc.sys_id, i), svc.safeName];
			} else if (svcOutageDay.partial > 0) {
				svcOutageDay.icon = "fa-times-circle";
				svcOutageDay.msg = gs.getMessage("{0} - partial functionality unavailable", svc.safeName);
				svcOutageDay.link = ["openOutage", "partial", getSpecificOutage(svc.sys_id, i), svc.safeName];
			}
			outs.push(svcOutageDay);
		}
		svc.outages = outs;
		data.categories[catIndex].services.push(svc);
	}


	function getOuts(serviceID) {
		var rtn = [];
		var num = 0;
		var mi = 0;
		var p1 = 0;
		var p2 = 0;
		var p3 = 0;
		var type = "";
		var outageId = ""
		var gr = new GlideRecord("x_fru_inc_incident");
		gr.addEncodedQuery("stateIN30,32,34^priorityIN1,2,3^ORmajor_incident=true^ORmajor_incident_state=accepted");
		gr.addQuery("business_service.sys_id",serviceID);
		gr.query();
		while (gr.next()) {
			num ++;
			if (gr.getValue('major_incident') == '1' || gr.getValue('major_incident_state') == 'accepted') {
				mi++;
			} else if (gr.getValue('priority') == '1' && gr.getValue('major_incident') == '0' || gr.getValue('major_incident_state') == 'null') {
				p1++;
			} else if (gr.getValue('priority') == '2' && gr.getValue('major_incident') == '0' || gr.getValue('major_incident_state') == 'null') {
				p2++;
			} else if (gr.getValue('priority') == '3' && gr.getValue('major_incident') == '0' || gr.getValue('major_incident_state') == 'null') {
				p3++;
			}
			if (num > 1) {
				type = 'M: ' + mi + ', P1: ' + p1 + ', P2: ' + p2 + ' and P3: ' + p3;
			} else {
				if (gr.getValue('major_incident') == '1' || gr.getValue('major_incident_state') == 'accepted') {
					type = 'Major Incident';
				} else if (gr.getValue('priority') == '1' && gr.getValue('major_incident') == '0' || gr.getValue('major_incident_state') == 'null') {
					type = '1 - Critical';
				} else if (gr.getValue('priority') == '2' && gr.getValue('major_incident') == '0' || gr.getValue('major_incident_state') == 'null') {
					type = '2 - High';
				} else if (gr.getValue('priority') == '3' && gr.getValue('major_incident') == '0' || gr.getValue('major_incident_state') == 'null') {
					type = '3 - Moderate';
				}
			}
			outageId = gr.getUniqueValue();
		}
		rtn.push(num);
		rtn.push(type);
		rtn.push(outageId);
		return rtn;
	}

})();
