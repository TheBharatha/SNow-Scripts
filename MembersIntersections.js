var NonBaseITIL = Class.create();
NonBaseITIL.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	nonmembers: function(groupSysId) {
		
		var memberNames = [];
		var mr = new GlideRecord('GROUPS_AND_MEMEBRS_TABLE_HERE');

		mr.addQuery('group', 'SYS_ID_OF_THE_BASE_ITIL_GROUP_HERE');
		mr.query();
		
		while (mr.next()) {
            memberNames.push(mr.getValue('user').toString());
        }
		
		var arrayUtil = new ArrayUtil();
		var userNames = [];
		var nonUsers = [];
		var urs = new GlideRecord('GROUPS_AND_MEMEBRS_TABLE_HERE');
		
		urs.query('user');
		
		while (urs.next()) {
			userNames.push(urs.getValue('user').toString());
		}
		
		nonUsers = arrayUtil.diff(userNames,memberNames);
		memberNames = [];
		userNames = [];
		
		return nonUsers;
	},
    type: 'NonBaseITIL'
});
