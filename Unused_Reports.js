var Unused_Reports = Class.create();
Unused_Reports.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	report: function(reportID) {
		var sysIDs = [];
		var repnames = new GlideRecord('report_stats');
		repnames.addEncodedQuery('report_sys_id.created_by_user.active=false^sys_updated_onRELATIVELT@year@ago@2');
		repnames.query();
		
		while (repnames.next()) {
			sysIDs.push(repnames.getValue('report_sys_id'));
		}
		
		return sysIDs;
	},
    type: 'Unused_Reports'
});