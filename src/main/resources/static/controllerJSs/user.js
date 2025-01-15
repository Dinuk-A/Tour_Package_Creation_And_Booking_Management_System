window.addEventListener('load', () => {

    buildUserTable();
    refreshUserForm();

})

//global var to store id of the table
let sharedTableId = "mainTableUser";

//to create and refresh content in main employee table
const buildUserTable = async () => {

    try {
        users = await ajaxGetReq("/user/all");

        const tableColumnInfo = [
            { displayType: 'function', displayingPropertyOrFn: getEmployeeCode, colHeadName: 'Emp Code' },
            { displayType: 'function', displayingPropertyOrFn: getEmployeeFullname, colHeadName: 'Name' },
            { displayType: 'text', displayingPropertyOrFn: 'username', colHeadName: 'Username' },
            { displayType: 'text', displayingPropertyOrFn: 'email', colHeadName: 'Email' },
            { displayType: 'function', displayingPropertyOrFn: getUserRoles, colHeadName: 'Role(s)' },
            { displayType: 'function', displayingPropertyOrFn: getUserStatus, colHeadName: 'Status' }
        ]

        createTable(tableUserHolderDiv, sharedTableId, users, tableColumnInfo);

        $(`#${sharedTableId}`).dataTable();
        // Initialize DataTables
        //  $(`#${sharedTableId}`).DataTable({
        //     destroy: true, // Ensure any existing instance is destroyed
        // });
    } catch (error) {
        console.error("Failed to refresh user table:", error);
        console.log("*****************");
        console.error("jqXHR:", error.jqXHR);
        console.error("Status:", error.textStatus);
        console.error("Error Thrown:", error.errorThrown);
    }
}

//to support fill main table
const getEmployeeCode = (userObj) => {
    return userObj.employee_id.emp_code;
}

//to support fill main table
const getEmployeeFullname = (userObj) => {
    return userObj.employee_id.fullname;
}

//to support fill main table
const getUserRoles = (userObj) => {

    let userRoles = '';
    userObj.roles.forEach((element, index) => {
        if (userObj.roles.length - 1 == index) {
            userRoles = userRoles + element.name;
        }
        else {
            userRoles = userRoles + element.name + ", ";
        }
    });

    return userRoles;
}

//to support fill main table
const getUserStatus = (userObj) => {
    if (userObj.acc_status) {
        return ' Account Is Active '

    } else {
        return 'Account Is Inactive '
    }
}

//fn to ready the main form for accept values
const refreshUserForm = async () => {

    user = new Object();
    oldUser = null;

    let userRoles = new Array();

    document.getElementById('formUser').reset();

    const empListWOUserAccs = await ajaxGetReq("/emp/listwithoutuseracc")
    fillMultDataIntoDynamicSelects(selectEmployee, 'Select Employee', empListWOUserAccs, 'emp_code', 'fullname')

    rolesList = await ajaxGetReq("/role/roleswoadmin");
    flushCollapseUserRoles.innerHTML = "";
    rolesList.forEach(element => {

        let newDiv = document.createElement('div');
        newDiv.className = "form-check form-check-inline";
        newDiv.style.minWidth = "200px"

        let newInput = document.createElement('input');
        newInput.classList.add("form-check-input");
        newInput.type = "checkbox";
        newInput.setAttribute('id', JSON.stringify(element.name))

        let newLabel = document.createElement('label');
        newLabel.classList.add("form-check-label");
        newLabel.innerText = element.name;

        newLabel.setAttribute('for', JSON.stringify(element.name))

        newInput.onchange = function () {
            if (this.checked) {
                userRoles.push(element)
            } else {

                userRoles.pop(element)

                //meka steps kipekata kadanna 💥💥💥
                let existIndex = userRoles.map(role => role.id).indexOf(element.id);
                if (existIndex != -1) {
                    userRoles.splice(existIndex, 1)
                }
            }
        }

        newDiv.appendChild(newInput);
        newDiv.appendChild(newLabel);

        flushCollapseUserRoles.appendChild(newDiv)

    });

    user.acc_status = false;

    // Array of input field IDs to reset
    const inputTagsIds = [
        'selectEmployee',
        'inputUserName',
        'inputPwd',
        'retypePwd',
        'inputEmail'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    userUpdateBtn.disabled = true;
    userUpdateBtn.style.cursor = "not-allowed";

    userAddBtn.disabled = false;
    userAddBtn.style.cursor = "pointer";

    /* INSERT (ADD KARANNA) PRIVI NATHTHAN FORM EKA OPEN KARADDIMA PENNANNA, YOU DONT HAVE PRIVI KIYALA  */
    //if (loggedAUserPrivilege.privinsert) {
    //    userAddBtn.disabled = false;
    //    userAddBtn.style.cursor = "pointer"
    //} else {
    //    userAddBtn.disabled = true;
    //    userAddBtn.style.cursor = "not-allowed"
    //}
}

//company ekema email ekak demu personal eka wenama thiyala 💥💥💥
// auto generate the email
const generateEmail = () => {

    const inputEmailVar = document.getElementById('inputEmail');
    const selectEmployeeVar = document.getElementById('selectEmployee');

    inputEmailVar.value = JSON.parse(selectEmployeeVar.value).email;
    user.email = inputEmailVar.value;
    inputEmailVar.style.border = "2px solid lime";
}

//fn for bind and validate the retype pw field
const retypePasswordVali = () => {

    const pwFirstInput = document.getElementById('inputPwd');
    const pwRetypeinput = document.getElementById('retypePwd');

    if (pwRetypeinput.value == pwFirstInput.value) {
        pwRetypeinput.style.border = "2px solid lime";
        user.password = pwRetypeinput.value;
    } else {
        pwRetypeinput.style.border = '2px solid red';
        user.password = null;
    }
}

//
const checkUserFormErrors = () => {
    let errors = '';

    if (user.employee_id == null) {
        errors = errors + "Employee name cannot be empty \n";

    }
    if (user.username == null) {
        errors = errors + "Username cannot be empty \n";

    }
    if (user.password == null) {
        errors = errors + "password cannot be empty \n";

    }

    if (user.email == null) {
        errors = errors + "Email cannot be empty \n";

    }
    if (user.roles.length == 0) {
        errors = errors + "Select at least one Role \n";

    }

    return errors;
}

//add a record ** ADD btn
const addNewUser = async () => {

    let errors = checkUserFormErrors();
    if (errors == '') {
        const userConfirm = confirm('Are you sure to add ?');

        if (userConfirm) {
            try {
                let postServerResponse = await ajaxPPDRequest("/user", "POST", user);
                if (postServerResponse === 'OK') {
                    alert('Saved Successfully');
                    buildUserTable();
                    document.getElementById('formUser').reset();
                    refreshUserform();

                } else {
                    alert('Submit Failed ' + postServerResponse);
                }
            } catch (error) {
                alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
            }

        } else {
            alert('User cancelled the task');
        }
    } else {
        alert('Form has following errors ' + errors);
    }
}

//fn for edit button  💥
const openModal = (userObj) => {

    document.getElementById('modalEmpCode').innerText = userObj.emp_code || 'N/A';
    document.getElementById('modalEmpFullName').innerText = userObj.fullname || 'N/A';
    document.getElementById('modalEmpNIC').innerText = userObj.nic || 'N/A';
    document.getElementById('modalEmpDOB').innerText = userObj.dob || 'N/A';
    document.getElementById('modalEmpEmail').innerText = userObj.email || 'N/A';
    document.getElementById('modalEmpMobileNum').innerText = userObj.mobilenum || 'N/A';
    document.getElementById('modalEmpLandNum').innerText = userObj.landnum || 'N/A';
    document.getElementById('modalEmpAddress').innerText = userObj.address || 'N/A';
    document.getElementById('modalEmpGender').innerText = userObj.gender || 'N/A';
    document.getElementById('modalEmpNote').innerText = userObj.note || 'N/A';

    // Show the modal
    $('#infoModalEmployee').modal('show');
};

// refill the form to edit a record
const refillUserForm = async (userObj) => {

    user = JSON.parse(JSON.stringify(userObj));
    oldUser = JSON.parse(JSON.stringify(userObj));

    //?????💥💥💥
    empListWOUserAcc = await ajaxGetReq("/emp/listwithoutuseracc");
    empListWOUserAcc.push(user.employee_id);
    fillMultDataIntoDynamicSelects(selectEmployee, "Select Employee", empListWOUserAcc, 'emp_code', 'fullname', user.employee_id.fullname);
    inputUserName.disabled = true;

    rolesList = await ajaxGetReq("/role/roleswoadmin");
    flushCollapseUserRoles.innerHTML = "";
    rolesList.forEach(element => {

        let newDiv = document.createElement('div');
        newDiv.className = "form-check form-check-inline";
        // newDiv.style.width = "30%";
        newDiv.style.minWidth = "200px"

        let newInput = document.createElement('input');
        newInput.classList.add("form-check-input");
        newInput.type = "checkbox";
        newInput.setAttribute('id', JSON.stringify(element.name))

        let newLabel = document.createElement('label');
        newLabel.classList.add("form-check-label");
        newLabel.innerText = element.name;

        newLabel.setAttribute('for', JSON.stringify(element.name))

        //change whole logic 💥💥💥
        newInput.onchange = function () {
            if (this.checked) {
                user.roles.push(element)
            } else {

                user.roles.pop(element)

                let existIndex = user.roles.map(role => role.id).indexOf(element.id);
                if (existIndex != -1) {
                    user.roles.splice(existIndex, 1)
                }
            }
        }

        let existIndex = user.roles.map(role => role.id).indexOf(element.id);
        if (existIndex != -1) {
            newInput.checked = true;
        }

        newDiv.appendChild(newInput);
        newDiv.appendChild(newLabel);

        flushCollapseUserRoles.appendChild(newDiv)

    });

    if (user.status) {
        document.getElementById('userAccActive').checked = true;
    } else {
        document.getElementById('userAccInactive').checked = true;
    }

    inputUserName.value = user.username;
    inputEmail.value = user.email;

    document.getElementById('inputPwd').disabled = true;
    document.getElementById('retypePwd').disabled = true;

    document.getElementById('userAddBtn').disabled = true;
    document.getElementById('userAddBtn').style.cursor = "not-allowed";

    document.getElementById('userUpdtBtn').disabled = false;
    document.getElementById('userUpdtBtn').style.cursor = "pointer";

    //edit karanna nodima inna mechchara dura noya, alert ekak danna 💥💥
    //    if (privileges.privupdate) {
    //        userUpdtBtn.disabled = false;
    //        userUpdtBtn.style.cursor="pointer"
    //    } else {
    //        userUpdtBtn.disabled = true;
    //        userUpdtBtn.style.cursor="not-allowed" 
    //    }

}

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshUserForm();
        }
    });
});

//fn for check changed values
const showUserValueChanges = () => {
    let updates = '';

    if (oldUser.username != user.username) {
        updates = updates + " Username will be changed into " + user.username;
    }

    if (oldUser.email != user.email) {
        updates = updates + " Email will be changed into " + user.email;
    }

    //change these too 💥💥💥
    if (user.roles.length != oldUser.roles.length) {
        alert("Role Has Changed");
    } else {

        for (let element of user.roles) {
            let existRoleCount = oldUser.roles.map(item => item.id).indexOf(element.id);

            if (existRoleCount == -1) {
                updates = updates + "role has changed";
                break;
            }
        }
    }

    if (user.status !== oldUser.status) {
        updates = updates + " Status will be change to " + user.status;
    }

    // ????
    //if (user.roles !== oldUser.role) {
    //    updates = updates + "role is change to " + user.role;
    //}


    return updates;
}

//fn for UPDATE btn
const updateUser = async () => {

    let errors = checkUserFormErrors();
    if (errors == '') {
        let updates = showUserValueChanges();
        if (updates == '') {
            alert('No changes detected to update')
        } else {
            let userResponse = confirm("Are you sure to proceed ? \n \n" + updates);
            if (userResponse) {

                try {
                    let putServiceResponse = await ajaxPPDRequest("/user", "PUT", user);

                    if (putServiceResponse === "OK") {
                        alert("Successfully Updated");
                        buildUserTable();
                        document.getElementById('formUser').reset();
                        refreshUserform();

                    } else {
                        alert("Update Failed \n" + putServiceResponse);
                    }
                } catch (error) {
                    alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
                }
            } else {
                alert("User cancelled the task");

            }
        }
    } else {
        alert('Form has following errors ' + errors)
    }
}

//fn for delete a record
const deleteUserRecord = async (userObj) => {

    const userConfirm = confirm('Are you sure to delete the following user account ? \n ' + userObj.username);

    if (userConfirm) {

        try {
            const deleteServerResponse = await ajaxPPDRequest("/user", "DELETE", userObj);

            if (deleteServerResponse === 'OK') {
                alert('Record Deleted');

            } else {
                alert('Delete Failed' + deleteServerResponce);
            }
        } catch (error) {
            alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        alert("User cancelled the task")
    }
}

//random pw generator ekak hadanna

