window.addEventListener('load', () => {

    buildPriviTable();
    refreshPrivilegeForm();
    refreshPriviFilters();

})

let roles = [];
let modules = [];

//for filters
const refreshPriviFilters = async () => {

    //get roles
    try {
        roles = await ajaxGetReq("role/exceptadmin");

        let allRoles = {
            id: -10,
            name: "All Roles"
        };
        roles.unshift(allRoles);

        fillDataIntoDynamicSelects(roleFilter, 'Please Select The Role', roles, 'name');
        console.log("Roles fetched for filter:", roles);

    } catch (error) {
        console.error("Error fetching roles for filter:", error);
    }

    //get modules
    try {
        modules = await ajaxGetReq("module/all");

        let allModules = {
            id: -10,
            name: "All Modules"
        };
        modules.unshift(allModules);

        fillDataIntoDynamicSelects(moduleFilter, 'Please Select The Module', modules, 'name');
        console.log("Modules fetched for filter:", modules);

    } catch (error) {
        console.error("Error fetching modules for filter:", error);

    }

}

//global var to store id of the table
let sharedTableId = "mainTablePrivi";

//create a custom table creation function because in this table we dont need a model since all info are visible in one window(full table)
const createPriviTableCustomFn = (dataContainer) => {

    // Clear out any previous data
    tablePriviHolderDiv.innerHTML = '';

    // Create main table tag
    const tableTag = document.createElement('table');
    tableTag.setAttribute('class', 'table table-bordered table-striped border-primary mt-2 mb-2');
    tableTag.setAttribute('id', sharedTableId);

    // Create thead
    const tableHead = document.createElement('thead');

    // Create a row for the head
    const tableHeadRow = document.createElement('tr');

    // Add the index column first
    const indexTH = document.createElement('th');
    indexTH.innerText = '#';
    tableHeadRow.appendChild(indexTH);

    //Array containing info related to table build
    const tableColumnInfoArray = [
        { displayType: 'function', displayingPropertyOrFn: getRoles, colHeadName: 'Role' },
        { displayType: 'function', displayingPropertyOrFn: getModule, colHeadName: 'Module' },
        { displayType: 'function', displayingPropertyOrFn: getSelect, colHeadName: 'Select' },
        { displayType: 'function', displayingPropertyOrFn: getInsert, colHeadName: 'Insert' },
        { displayType: 'function', displayingPropertyOrFn: getUpdate, colHeadName: 'Update' },
        { displayType: 'function', displayingPropertyOrFn: getDelete, colHeadName: 'Delete' }
    ]

    // Add other column headers
    tableColumnInfoArray.forEach(columnObj => {
        const columnHead = document.createElement('th');
        columnHead.innerText = columnObj.colHeadName;
        columnHead.setAttribute('class', ('text-center justify-content-center col-head col-' + columnObj.colHeadName));
        tableHeadRow.appendChild(columnHead);
    });

    // Add the button column last
    const buttonTH = document.createElement('th');
    buttonTH.innerText = 'Action';
    buttonTH.classList = 'text-center justify-content-center';
    tableHeadRow.appendChild(buttonTH);

    // Append the row to the thead
    tableHead.appendChild(tableHeadRow);

    // Create tbody
    const tableBody = document.createElement('tbody');

    // Populate tbody with data
    dataContainer.forEach((record, index) => {
        const row = document.createElement('tr');

        // Index column
        const indexCell = document.createElement('td');
        indexCell.innerText = index + 1;
        indexCell.setAttribute('class', 'text-center justify-content-center');
        row.appendChild(indexCell);

        // Data columns
        tableColumnInfoArray.forEach(columnObj => {
            const cell = document.createElement('td');
            cell.setAttribute('class', 'text-center justify-content-center');

            //different scenarios for different display types
            switch (columnObj.displayType) {
                case "text":
                    //ex: employee[0][fullname]
                    cell.innerText = record[columnObj.displayingPropertyOrFn];
                    break;

                case "function":
                    //ex: getDesignation(employee[0])
                    cell.innerHTML = columnObj.displayingPropertyOrFn(record)
                    break;

                default:
                    showAlertModal('err', "error creating table");
                    break;
            }
            row.appendChild(cell);
        });

        // Action button cell in last (2 buttons)
        const buttonCell = document.createElement('td');
        buttonCell.setAttribute('class', 'text-center justify-content-center');

        //create an EDIT button to insert inside this cell
        const editButton = document.createElement('button');
        editButton.setAttribute('class', 'btn-edit fw-bold');
        editButton.innerText = "Edit";

        //function for edit button
        editButton.onclick = function () {

            refillPriviForm(record);

            //window['currentObject'] = record;

        }

        //create an DELETE button to insert inside this cell
        const deleteButton = document.createElement('button');
        deleteButton.setAttribute('class', 'ms-1 btn-delete fw-bold');
        deleteButton.innerText = "Delete";

        //function for delete button
        deleteButton.onclick = function () {

            deletePriviRecord(record);
            //window['currentObject'] = record;
            // window['currentObjectIndex'] = index;

        }

        //append those 2 buttons to the cell
        buttonCell.appendChild(editButton);
        buttonCell.appendChild(deleteButton);

        //append that cell to the row
        row.appendChild(buttonCell);

        tableBody.appendChild(row);
    });

    // Append thead and tbody to the table
    tableTag.appendChild(tableHead);
    tableTag.appendChild(tableBody);

    // Append the table to the holder div
    tablePriviHolderDiv.appendChild(tableTag);
}

let permissions = [];

//define fn for refresh privilege table
const buildPriviTable = async () => {

    try {

        permissions = await ajaxGetReq("/privilege/all");

        createPriviTableCustomFn(permissions);

        $(`#${sharedTableId}`).dataTable({
            destroy: true, // Allows re-initialization
            searching: false, // Remove the search bar
            info: false, // Show entries count
            pageLength: 10, // Number of rows per page
            ordering: false,// Remove up and down arrows
            lengthChange: false // Disable ability to change the number of rows
            // dom: 't', // Just show the table (t) with no other controls
        });

    } catch (error) {
        console.error("Failed to build privi table:", error);
        console.log("*****************");
        //console.error("jqXHR:", error.jqXHR);
        //console.error("Status:", error.textStatus);
        //console.error("Error Thrown:", error.errorThrown);
    }

}

//filters for privi tbl
const applyPrivilegeFilter = () => {

    const selectedRoleRaw = document.getElementById('roleFilter').value;
    const selectedModuleRaw = document.getElementById('moduleFilter').value;

    let selectedRole = null;
    let selectedModule = null;

    try {
        selectedRole = JSON.parse(selectedRoleRaw);
        selectedModule = JSON.parse(selectedModuleRaw);
    } catch (e) {
        console.error("Error parsing selected filter options:", e);
    }

    const filteredPermissions = permissions.filter(p => {
        let isRoleMatch = true;
        let isModuleMatch = true;

        if (selectedRole && selectedRole.id !== -10) {
            isRoleMatch = p.role_id.id === selectedRole.id;
        }

        if (selectedModule && selectedModule.id !== -10) {
            isModuleMatch = p.module_id.id === selectedModule.id;
        }

        return isRoleMatch && isModuleMatch;
    });

    console.log("Filtered Permissions:", filteredPermissions);

    $('#mainTablePrivi').empty();

    if ($.fn.DataTable.isDataTable('#mainTablePrivi')) {
        $('#mainTablePrivi').DataTable().clear().destroy();
    }

    createPriviTableCustomFn(filteredPermissions);

    setTimeout(() => {
        $(`#${sharedTableId}`).DataTable({
            searching: false,
            info: false,
            pageLength: 10,
            ordering: false,
            lengthChange: false
        });
    }, 100);
};


//clear out any filters
function resetPrivilegeFilters() {
    document.getElementById('roleFilter').value = '';
    document.getElementById('moduleFilter').value = '';
    applyPrivilegeFilter(); 
}


const getRoles = (priviObj) => {
    return priviObj.role_id.name;
}

const getModule = (priviObj) => {
    return priviObj.module_id.name;
}

const getSelect = (priviObj) => {
    if (priviObj.prvselect) {
        return "✅"
    } else {
        return "🟥"
    }
}

const getInsert = (priviObj) => {
    if (priviObj.prvinsert) {
        return "✅"
    } else {
        return "🟥"
    }
}

const getUpdate = (priviObj) => {
    if (priviObj.prvupdate) {
        return "✅"
    } else {
        return "🟥"
    }
}

const getDelete = (priviObj) => {
    if (priviObj.prvdelete) {
        return "✅"
    } else {
        return "🟥"
    }
}



//fn for refresh privi form
const refreshPrivilegeForm = async () => {

    privilege = new Object();
    document.getElementById('formPrivilege').reset();

    fillDataIntoDynamicSelects(selectRole, 'Please Select The Role', roles, 'name');
    selectRole.disabled = false;

    fillDataIntoDynamicSelects(selectModule, 'Please Select The Module', modules, 'name');
    selectModule.disabled = false;

    selectRole.style.border = "1px solid #ced4da";
    selectModule.style.border = "1px solid #ced4da";

    privilege.prvselect = false;
    privilege.prvinsert = false;
    privilege.prvupdate = false;
    privilege.prvdelete = false;

    priviUpdateBtn.disabled = true;
    priviUpdateBtn.style.cursor = "not-allowed";

    priviAddBtn.disabled = false;
    priviAddBtn.style.cursor = "pointer";

    prvFormResetBtn.classList.remove('d-none');
};


//custom checkbox validator function 

// onchange="checkPrivi(deleteSwitch, 'privilege' , 'prvdelete',true, false, labelDelete,'Delete')"
const checkPriviOri = (feildId, object, property, trueValue, falseValue,
    labelId, prvType) => {

    if (feildId.checked) {
        window[object][property] = trueValue;
        labelId.innerHTML = prvType + ' Privilege <span class="text-success fw-bold"> Granted <span>';
    } else {
        window[object][property] = falseValue;
        labelId.innerHTML = prvType + ' Privilege <span class="text-danger fw-bold"> Not Granted <span>';
    }
}

const setPrivileges = (buttonId, propertyName) => {
    if (buttonId.checked) {
        window.privilege[propertyName] = true;
    } else {
        window.privilege[propertyName] = false;
    }
}

const revokePrivileges = (buttonId, propertyName) => {
    if (buttonId.checked) {
        window.privilege[propertyName] = false;
    } else {
        window.privilege[propertyName] = true;
    }
}

//filter module list by given role
const generateModuleListOri = async () => {

    modulesByRole = await ajaxGetReq("/module/listbyrole?roleid=" + JSON.parse(selectRole.value).id);

    fillDataIntoDynamicSelects(selectModule, 'Please Select Module', modulesByRole, 'name');
    selectModule.disabled = false;
}

//same as above but with promises 💥
const generateModuleList = async () => {
    try {
        const selectedRole = JSON.parse(selectRole.value);

        const modulesByRole = await ajaxGetReq(`/module/listbyrole?roleid=${selectedRole.id}`);

        fillDataIntoDynamicSelects(selectModule, 'Please Select Module', modulesByRole, 'name');
        selectModule.disabled = false;

    } catch (error) {
        console.error("Failed to fetch modules by role:", error);
        console.error("Details - jqXHR:", error.jqXHR, "Status:", error.textStatus, "Error Thrown:", error.errorThrown);
    }
};


//define fn ckeckerror
const checkPriviFormErrors = () => {

    let errors = '';

    if (privilege.role_id == null) {
        errors = errors + "Please select the ROLE  \n";
    }
    if (privilege.module_id == null) {
        errors = errors + "Please select the MODULE \n";
    }
    if (privilege.prvselect == null) {
        errors = errors + "Please select 'SELECT' privilege  \n";
    }
    if (privilege.prvinsert == null) {
        errors = errors + "Please select 'INSERT' privilege  \n";
    }
    if (privilege.prvupdate == null) {
        errors = errors + "Please select 'UPDATE' privilege \n";
    }
    if (privilege.prvdelete == null) {
        errors = errors + "Please select 'DELETE' privilege  \n";
    }

    return errors;
}

//fn for add button
const addPrivileges = async () => {

    //chech form errors
    let errors = checkPriviFormErrors();

    if (errors == '') {
        const userConfirm = confirm("Are you sure to grant permissions to role  " + privilege.role_id.name + " for the module " + privilege.module_id.name)

        if (userConfirm) {
            try {
                const postServerResponse = await ajaxPPDRequest("/privilege", "POST", privilege);

                if (postServerResponse === 'OK') {
                    showAlertModal('suc', 'Saved Successfully');
                    document.getElementById('formPrivilege').reset();
                    buildPriviTable();
                    refreshPrivilegeForm();
                } else {
                    showAlertModal('err', 'Submit Failed ' + postServerResponse);
                }
            } catch (error) {
                showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
            }
        } else {
            showAlertModal('inf', "user cancelled the task")
        }
    } else {
        showAlertModal('err', errors)
    }
}

//to refill privilege form
const refillPriviForm = async (prvObj) => {

    privilege = JSON.parse(JSON.stringify(prvObj));
    oldPrivOb = JSON.parse(JSON.stringify(prvObj));

    try {
        roles = await ajaxGetReq("role/exceptadmin");
        fillDataIntoDynamicSelects(selectRole, 'Please Select The Role', roles, 'name', prvObj.role_id.name);
        selectRole.disabled = true;

        modules = await ajaxGetReq("module/all");
        fillDataIntoDynamicSelects(selectModule, 'Please Select The Module', modules, 'name', prvObj.module_id.name);
        selectModule.disabled = true;

    } catch (error) {
        console.error("Error in refillPriviForm:", error);
    }

    if (prvObj.prvselect) {
        selectGrantSwitch.checked = true;
    } else {
        selectRevokeSwitch.checked = true;
    }

    if (prvObj.prvinsert) {
        insertGrantSwitch.checked = true;
    } else {
        insertRevokeSwitch.checked = true;
    }

    if (prvObj.prvupdate) {
        updateGrantSwitch.checked = true;
    } else {
        updateRevokeSwitch.checked = true;
    }

    if (prvObj.prvdelete) {
        deleteGrantSwitch.checked = true;
    } else {
        deleteRevokeSwitch.checked = true;
    }

    priviUpdateBtn.disabled = false;
    priviUpdateBtn.style.cursor = "pointer";

    priviAddBtn.disabled = true;
    priviAddBtn.style.cursor = "not-allowed";

    prvFormResetBtn.classList.add('d-none');

    var myPrvFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myPrvFormTab.show();

}

//fn for compare and check updated values
const showValueChanges = () => {
    let updates = '';

    if (privilege.role_id.name != oldPrivOb.role_id.name) {
        updates = updates + " Role changed \n";
    }

    if (privilege.module_id.name != oldPrivOb.module_id.name) {
        updates = updates + " Module changed \n";
    }

    if (privilege.prvselect != oldPrivOb.prvselect) {
        updates = updates + " SELECT privilege has changed \n";
    }

    if (privilege.prvinsert != oldPrivOb.prvinsert) {
        updates = updates + " INSERT privilege has changed \n";
    }

    if (privilege.prvupdate != oldPrivOb.prvupdate) {
        updates = updates + " UPDATE privilege has changed \n";
    }

    if (privilege.prvdelete != oldPrivOb.prvdelete) {
        updates = updates + " DELETE privilege has changed \n";
    }

    return updates;
}

//fn for update button
const updatePrivileges = async () => {

    let errors = checkPriviFormErrors();
    if (errors == "") {

        let updates = showValueChanges();
        if (updates == "") {
            showAlertModal('err', "No changes detected to update");
        } else {

            let userConfirm = confirm("Are you sure to update following record? \n \n" + updates);

            if (userConfirm) {

                try {
                    let putServiceResponse = await ajaxPPDRequest("/privilege", "PUT", privilege);

                    if (putServiceResponse === "OK") {
                        showAlertModal('suc', "Successfully Updated");
                        buildPriviTable();
                        document.getElementById('formPrivilege').reset();
                        refreshPrivilegeForm();

                    } else {
                        showAlertModal('err', "Update Failed \n" + putServiceResponse);
                    }

                } catch (error) {
                    showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
                }

            } else {
                showAlertModal('inf', "User cancelled the task");
            }
        }
    } else {
        showAlertModal('err', errors);
    }
}

//fn for DELETE btn
const deletePriviRecord = async (prvObj) => {

    const userConfirm = confirm('Are you sure to delete ?');

    if (userConfirm) {

        try {
            const deleteServerResponse = await ajaxPPDRequest("/privilege", "DELETE", prvObj);
            if (deleteServerResponse === 'OK') {
                showAlertModal('suc', 'Record Deleted');

            } else {
                showAlertModal('err', 'Delete Failed' + deleteServerResponce);
            }

        } catch (error) {
            showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        showAlertModal('inf', "User cancelled the task")
    }

}

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshPrivilegeForm();
        }
    });
});

//print entire table module vise or ??? 💥💥💥
const printPrivi = (prvObj) => { showAlertModal('inf', 'test print ') }

//const adults = users.filter(user => user.age >= 18);
//is same as
//const adults = users.filter(user => {
//    return user.age >= 18;
//});
