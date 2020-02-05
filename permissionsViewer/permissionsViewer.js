import { LightningElement, track, api } from 'lwc';

import getAllPermissionSets from '@salesforce/apex/PermissionsViewerController.getAllPermissionSets';
import getAllFieldPermissions from '@salesforce/apex/PermissionsViewerController.getAllFieldPermissions';
import getAllObjectPermissions from '@salesforce/apex/PermissionsViewerController.getAllObjectPermissions';
import getAllSetupPermissions from '@salesforce/apex/PermissionsViewerController.getAllSetupPermissions';

//Columns for each of the tables
const permissionSetColumns = [
    { label: 'Name', fieldName: 'Field', type: 'text' },
    { label: 'Read', fieldName: 'Read', type: 'boolean' },
    { label: 'Edit', fieldName: 'Edit', type: 'boolean' }
];

const objectColumns = [
    { label: 'Object', fieldName: 'Object', type: 'text' },
    { label: 'Create', fieldName: 'Create', type: 'boolean' },
    { label: 'Read', fieldName: 'Read', type: 'boolean' },
    { label: 'Update', fieldName: 'Update', type: 'boolean' },
    { label: 'Delete', fieldName: 'Delete', type: 'boolean' },
    { label: 'View All', fieldName: 'ViewAll', type: 'boolean' },
    { label: 'Modify All', fieldName: 'ModifyAll', type: 'boolean' }
];

const setupColumns = [
    { label: 'Type', fieldName: 'Type', type: 'text' },
    { label: 'Value', fieldName: 'Entity', type: 'id' },
];

export default class PermissionsViewer extends LightningElement {
    @track selectedPermissionSet; //ID of the Permission Set selected in the drop-down combo box

    //Queried data
    @track permissionSets;
    @track fieldPermissions;
    @track objectPermissions;
    @track setupPermissions;

    @track results; //Holds table contents

    @track permissionSetColumns = permissionSetColumns;
    @track objectColumns = objectColumns;
    @track setupColumns = setupColumns;

    //Check if the data has been loaded. If not, display a spinner
    @api
    get loaded() {
        return this.permissionSets !== undefined;
    }
    
    //Run queries on load
    connectedCallback() {
        this.initialQueries();
    }
    
    initialQueries() {
        //Retrieve all permission sets
        getAllPermissionSets().then(result => {
            //Replace Id with value and Label with label (required for the combo box)
            this.permissionSets = JSON.parse(JSON.stringify(result).replace(/"Id"/g, "\"value\"").replace(/"Label"/g, "\"label\""));
        });

        //Retrieve all permission set field permissions
        getAllFieldPermissions().then(result => {
            this.fieldPermissions = result;    
        });

        //Retrieve all object permissions
        getAllObjectPermissions().then(result => {
            this.objectPermissions = result;    
        });

        //Retrieve all setup permissions
        getAllSetupPermissions().then(result => {
            this.setupPermissions = result;    
        });
    }

    permissionSetSelected(event) {
        this.selectedPermissionSet = event.detail.value;
        this.filterResults();
    }

    tabChange() {
        if(this.selectedPermissionSet !== undefined) //Don't update the table if a permission set hasn't been selected yet
            this.filterResults();
    }

    //Return a list of records that are related to the currently selected permission set
    filterResults() {
        var results = [];
        var key;
        var i = 0;
        
        switch(this.template.querySelector('lightning-tabset').activeTabValue) {
            //If on the 'Fields' tab
            case "Fields":
            default:
                for(i = 0; i < this.fieldPermissions.length; i++) {
                    if(this.fieldPermissions[i].ParentId === this.selectedPermissionSet) {
                        let obj = {
                            Field : this.fieldPermissions[i].Field,
                            Read : this.fieldPermissions[i].PermissionsRead,
                            Edit : this.fieldPermissions[i].PermissionsEdit
                        }

                        results.push(obj);
                    }
                }
                break;
                //If on the 'Objects' tab
                case "Objects":
                    for(i = 0; i < this.objectPermissions.length; i++) {
                        if(this.objectPermissions[i].ParentId === this.selectedPermissionSet) {
                            let obj = {
                                Object : this.objectPermissions[i].SobjectType,
                                Create : this.objectPermissions[i].PermissionsCreate,
                                Read : this.objectPermissions[i].PermissionsRead,
                                Update : this.objectPermissions[i].PermissionsEdit,
                                Delete : this.objectPermissions[i].PermissionsDelete,
                                ViewAll : this.objectPermissions[i].PermissionsViewAllRecords,
                                ModifyAll : this.objectPermissions[i].PermissionsModifyAllRecords
                            }
    
                            results.push(obj);
                        }
                    }
                break;
                //If on the 'Setup' tab
                case "Setup":
                    for(i = 0; i < this.setupPermissions.length; i++) {
                        if(this.setupPermissions[i].ParentId === this.selectedPermissionSet) {
                            let obj = {
                                Type : this.setupPermissions[i].SetupEntityType,
                                Entity : this.setupPermissions[i].SetupEntityId,
                            }
    
                            results.push(obj);
                        }
                    }
                    //Get all User permissions
                    for(i = 0; i < this.permissionSets.length; i++) {
                        if(this.permissionSets[i].value === this.selectedPermissionSet) {
                            //Cycle throuch each key/value pair and find any that are true. Add true values to results
                            for(key of Object.keys(this.permissionSets[i])) {
                                if(key.startsWith('Permissions') && this.permissionSets[i][key]) {
                                    let obj = {
                                        Type : key,
                                        Entity : 'True',
                                    }
            
                                    results.push(obj);
                                }
                            }

                            break;
                        }
                    }
                break;
        }
        this.results = results;
    }
}