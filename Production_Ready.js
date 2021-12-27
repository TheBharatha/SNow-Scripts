var Production_Ready = Class.create();
Production_Ready.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	getritms: function(ritmids) {
		var readyReqs = [];
		var prodritms = new GlideRecord('sc_req_item'); //Request Item table
		prodritms.addEncodedQuery('active=true^cat_item=cc0d8a5d4f524bc0d73ed49f0310c7f4^u_cab_dateRELATIVELT@dayofweek@ahead@7^u_cab_date>=javascript:gs.beginningOfToday()');
		prodritms.query();

		while(prodritms.next()) {
			var desiredTask = 0;
			var sctask = new GlideRecord('sc_task'); //Task table
			sctask.addEncodedQuery('request.numberIN'+prodritms.getDisplayValue('request'));
			sctask.query();
			var totalTasks = sctask.getRowCount();

			while(sctask.next()) {
				if (sctask.getValue('state') == 3 || sctask.getValue('state') == 7) {
					desiredTask++;
				} else if (sctask.getValue('state') == 1 && sctask.getValue('short_description') == 'Review Prod Readiness Completion and Update Prod Readiness Metric Check boxes') {
					desiredTask++;
				} else {
					continue;
				}
			}
			if (totalTasks == desiredTask) {
				readyReqs.push(prodritms.getDisplayValue('number'));
			}
		}
		return readyReqs;
	},
	type: 'Production_Ready'
});