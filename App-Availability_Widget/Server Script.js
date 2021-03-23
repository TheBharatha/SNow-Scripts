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

	data.categories = [];
	var svs = new GlideRecord("application_table_name_here");
	svs.addQuery("query_for_the_list_of_apps_here");
	svs.addQuery("add_other_query_filters_if_necessary");
	svs.setLimit(options.number_of_services || 250); //capping the number of applications to be shown in the list
	svs.orderByDesc("category");
	svs.orderBy("field_of_your_choice_from_the_table");
	svs.query();
	var currentCategory = "-";
	var catIndex = -1;
	while (svs.next()) {
		var cat = svs.getValue("category");
		if (cat != currentCategory) {
			catIndex++;
			currentCategory = cat;
			data.categories[catIndex] = {};
			data.categories[catIndex].name = cat;
			data.categories[catIndex].label = svs.getDisplayValue("category");
			if (data.categories[catIndex].label == "")
				data.categories[catIndex].label = gs.getMessage("Business Applications");
			data.categories[catIndex].services = [];
		}
		var svc = {};
		svc.sys_id = svs.getUniqueValue();
		svc.name = svs.getDisplayValue();
		svc.safeName = GlideStringUtil.escapeHTML(svc.name);
		svc.curOutages = getOuts(svc.sys_id); //function to get detailed 
		
		var outs = [];
		for (var i = 0; i <= 6; i++) {
			var out = new GlideAggregate("outage_table_name_here");
			out.addQuery("common_field_name", svs.getUniqueValue());
			out.addQuery("outage_begin", "<=", gs.daysAgoEnd(i));
			out.addQuery("outage_end", ">=", gs.daysAgoStart(i)).addOrCondition("end", "=", "NULL");
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
				svcOutageDay.msg = gs.getMessage("{0} - planned maintenance", svc.safeName);
				svcOutageDay.link = ["openOutage", "planned", getSpecificOutage(svc.sys_id, i), svc.safeName];
			} else if (svcOutageDay.partial > 0) {
				svcOutageDay.icon = "fa-info-circle";
				svcOutageDay.msg = gs.getMessage("{0} - partial functionality unavailable", svc.safeName);
				svcOutageDay.link = ["openOutage", "partial", getSpecificOutage(svc.sys_id, i), svc.safeName];
			}
			outs.push(svcOutageDay);
		}
		svc.outages = outs;
		data.categories[catIndex].services.push(svc);
	}
	data.dates = [];
	for (var j = 7; j > 0; j--) {
		var d = new GlideDate();
		d.subtract(1000 * 3600 * 24 * (j - 1));
		data.dates.push(d.getDisplayValueInternal());
	}
	
	data.subs = [];

	function getOuts(serviceID) {
		var rtn = [];
		var num = 0;
		var type = "";
		var outageId = ""
		var gr = new GlideRecord("incident_table_name_to_get_current_outage");
		gr.addEncodedQuery('query_condition_to_select_the_major_inc_p1_p2_incidents');
		gr.addQuery("common_field.sys_id",serviceID);
		gr.query();
		while (gr.next()) {
			num++;
			if (num > 1) {
				type = "Multiple";
			} else {
				if (gr.getValue('major_incident') == '1' || gr.getValue('major_incident_state') == 'accepted') {
					type = 'Major Incident';
				} else if (gr.getValue('priority') == '1' && gr.getValue('major_incident') == '0' || gr.getValue('major_incident_state') == 'null') {
							type = '1 - Critical';
				} else if (gr.getValue('priority') == '2' && gr.getValue('major_incident') == '0' || gr.getValue('major_incident_state') == 'null') {
					type = '2 - High';
				}
				outageId = gr.getUniqueValue();
			}
		}
		rtn.push(num);
		rtn.push(type);
		rtn.push(outageId);
		return rtn;
	}
	
	function getSpecificOutage(sysid, day) {
		var gr = new GlideRecord("outage_table_name_here"); //counts records where...
		gr.addQuery("common_field_name", sysid); //the CI is the current service
		gr.addQuery("outage_end", ">=", gs.daysAgoStart(day)).addOrCondition("end", "=", "NULL");
		gr.addQuery("outage_begin", "<=", gs.daysAgoEnd(day));
		gr.query();
		
		if(gr.next()) {
			return gr.getUniqueValue();
		} else {
			return "No Results";
		}
	}

})();
