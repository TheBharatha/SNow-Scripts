var NonCertifiedMemberGroup = Class.create();
NonCertifiedMemberGroup.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	specialGroup: function(groupSysId) {
		//Step 1: Get the user Sys IDs from SN Role - Base ITIL User group
		var baseITILUsers = [];
		var snBaseItilGroup = new GlideRecord('sys_user_grmember');
		snBaseItilGroup.addQuery('group', '7909b9b713494700e7075a132244b08d');
		snBaseItilGroup.query();
		
		while (snBaseItilGroup.next()) {
			baseITILUsers.push(snBaseItilGroup.getValue('user').toString());
		}
		
		//Step 2: Get the Group Sys ID with 0 member count and those groups which do not have any members present in baseITILUsers array
		var groupNames = [];
		var arrayUtil = new ArrayUtil();
		var userGroup = new GlideRecord("sys_user_group");
		userGroup.addActiveQuery();
		userGroup.query();
		
		while (userGroup.next()) {
			var groupFilter = new GlideAggregate('sys_user_grmember');
			groupFilter.addQuery('group',userGroup.sys_id.toString());
			groupFilter.addAggregate('COUNT');
			groupFilter.query();
			
			//Check for groups with member count 0 and push them to groupNames array
			var memberCount = 0;
			if (groupFilter.next()) {
				memberCount = groupFilter.getAggregate('COUNT');
				if (memberCount == 0) {
					groupNames.push(userGroup.sys_id.toString());
				} else {
					var found = 0;
					var findGroup = new GlideRecord('sys_user_grmember');
					findGroup.addQuery('group',userGroup.sys_id.toString());
					findGroup.query();
					
					while (findGroup.next()) {
						if (arrayUtil.contains(baseITILUsers,findGroup.getValue('user').toString())) {
							found += 1;
						}
					}
					
					if (found == 0) {
						groupNames.push(userGroup.sys_id.toString());
					}
				}
			}
		}
		
		return groupNames;
		
	},
    type: 'NonCertifiedMemberGroup'
});