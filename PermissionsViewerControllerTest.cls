@isTest
public class PermissionsViewerControllerTest {
    @TestSetup
    private static void makeData(){
        PermissionSet ps = new PermissionSet(Name='Good', Label='Good', PermissionsViewRoles=true);
        insert ps;

        ObjectPermissions op = new ObjectPermissions(ParentId = ps.Id, PermissionsCreate=true, PermissionsRead=true, SobjectType='Account');
        insert op;

        FieldPermissions fp = new FieldPermissions(ParentId = ps.Id, PermissionsRead=true, Field='Account.AccountNumber', SobjectType='Account');
        insert fp;

        ApexClass apex = [SELECT Id FROM ApexClass WHERE Name = 'PermissionsViewerController'];

        SetupEntityAccess sea = new SetupEntityAccess(ParentId = ps.Id, SetupEntityId = apex.Id);
        insert sea;
    }


    @isTest
    public static void retrieveData() {
        PermissionSet currentPS;

        //Check Permission Sets
        List<PermissionSet> permissionSets = PermissionsViewerController.getAllPermissionSets();
        System.assertEquals([SELECT Count() FROM PermissionSet WHERE IsOwnedByProfile = false], permissionSets.size());
        
        boolean valid = false;
        System.assert(permissionSets.size() >= 1);
        for(PermissionSet ps : permissionSets) {
            if(ps.Label == 'Good') {
                valid = true;
                currentPS = ps;
            }
        }

        System.assert(valid, 'Could not find the correct permission set');

        //Check Object Permissions
        List<ObjectPermissions> objectPermissions = PermissionsViewerController.getAllObjectPermissions();
        System.assert(objectPermissions.size() >= 1);

        valid = false;
        for(ObjectPermissions op : objectPermissions) {
            if(op.ParentId == currentPS.Id) {
                valid = true;
                break;
            }
        }

        System.assert(valid, 'Could not find the correct object permissions');

        //Check Field Permissions
        List<FieldPermissions> fieldPermissions = PermissionsViewerController.getAllFieldPermissions();
        System.assert(fieldPermissions.size() >= 1);

        valid = false;
        for(FieldPermissions fp : fieldPermissions) {
            if(fp.ParentId == currentPS.Id) {
                valid = true;
                break;
            }
        }

        System.assert(valid, 'Could not find the correct setup permissions');

        //Check Setup Permissions
        List<SetupEntityAccess> setupPermissions = PermissionsViewerController.getAllSetupPermissions();
        System.assert(setupPermissions.size() >= 1);

        valid = false;
        for(SetupEntityAccess sea : setupPermissions) {
            if(sea.ParentId == currentPS.Id) {
                valid = true;
                break;
            }
        }

        System.assert(valid, 'Could not find the correct setup permissions');
    }
}
