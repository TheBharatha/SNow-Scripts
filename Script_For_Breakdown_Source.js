var Unique_ptm = Class.create();
Unique_ptm.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	distinct_members: function (listMembers) {
		
		var allmembers = [];
		var appCode = [];
		var arrayUtil = new ArrayUtil();
		var ptms = new GlideRecord('cmdb_ci_business_app');
		
		ptms.addQuery('u_imc_status','active');
		ptms.addNotNullQuery('u_product_technology_manager','DISTINCT');
		ptms.query();
		while (ptms.next()) {
			if (arrayUtil.contains(allmembers, ptms.u_product_technology_manager.toString())) {
				continue;
			} else {
				allmembers.push(ptms.u_product_technology_manager.toString());
				appCode.push(ptms.u_application_code.toString());
			}
		}
		allmembers = [];
		return appCode;
	},

    type: 'Unique_ptm'
});