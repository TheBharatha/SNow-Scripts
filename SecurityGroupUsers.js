var SecurityGroupUsers = Class.create();
SecurityGroupUsers.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	members: function(groupSysId) {
		
		var groupNames = [];
		var groupFilter = new GlideRecord('table_name_here');
		groupFilter.addQuery('group.type','CONTAINS','sys_id_of_the_group-type_here');
		groupFilter.addQuery('user.active','true');
		groupFilter.query();
		
		while (groupFilter.next()) {
			groupNames.push(groupFilter.getValue('sys_id').toString());
		}
		return groupNames;
	},
    type: 'SecurityGroupUsers'
});
