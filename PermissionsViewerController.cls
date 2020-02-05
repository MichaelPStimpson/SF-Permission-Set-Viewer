public with sharing class PermissionsViewerController {
    @AuraEnabled(cacheable=true)
    public static List<PermissionSet> getAllPermissionSets() {
        //Generate a SOQL query with all of the permission fields
        Set<String> permissions = PermissionSet.SObjectType.getDescribe().fields.getMap().keySet();
        String soql = 'SELECT Id, Label';

        for(String s : permissions) {
            if(s.startsWith('permissions'))
                soql += ', ' + s;
        }

        soql += ' FROM PermissionSet WHERE IsOwnedByProfile = false';

        //Get Permission Sets, filter out all Profiles
        return Database.query(soql);
    }

    @AuraEnabled(cacheable=true)
    public static List<FieldPermissions> getAllFieldPermissions(){
        //Get field permissions, filter out all Profiles
        return [SELECT Field, ParentId, PermissionsEdit, PermissionsRead FROM FieldPermissions WHERE Parent.IsOwnedByProfile = false];
    }

    @AuraEnabled(cacheable=true)
    public static List<ObjectPermissions> getAllObjectPermissions(){
        //Get object permissions. Filter out all Profiles
        return [SELECT ParentId, PermissionsCreate, PermissionsDelete, PermissionsEdit, PermissionsRead, PermissionsModifyAllRecords, PermissionsViewAllRecords, SobjectType FROM ObjectPermissions WHERE Parent.IsOwnedByProfile = false];
    }

    @AuraEnabled(cacheable=true)
    public static List<SetupEntityAccess> getAllSetupPermissions(){
        //Get object permissions. Filter out all Profiles
        return [SELECT ParentId, SetupEntityId, SetupEntityType FROM SetupEntityAccess WHERE Parent.IsOwnedByProfile = false];
    }
}
