var NoMembersGroup = Class.create();
NoMembersGroup.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	emptyGroup: function(groupSysId) {
		
		var groupNames = [];
		var userGroup = new GlideRecord("sys_user_group");
		userGroup.addActiveQuery();
		userGroup.query();
		
		while (userGroup.next()) {
			var groupFilter = new GlideAggregate('sys_user_grmember');
			groupFilter.addQuery('group',userGroup.sys_id.toString());
			groupFilter.addAggregate('COUNT');
			groupFilter.query();
			
			var memberCount = 0;
			if (groupFilter.next()) {
				memberCount = groupFilter.getAggregate('COUNT');
				if (memberCount == 0) {
					groupNames.push(userGroup.sys_id.toString());
				}
			}
		}
		return groupNames;
	},
    type: 'NoMembersGroup'
});
