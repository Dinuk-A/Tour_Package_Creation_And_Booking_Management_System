window.addEventListener('load', () => {

    buildUserTable();
    refreshUserForm();

})

//global var to store id of the table
let sharedTableId = "mainTableUser";

//to create and refresh content in main employee table
const buildUserTable = async () => {

    try {

        //  /user/exceptadminloggeduser
        users = await ajaxGetReq("/user/exceptadmin");

        const tableColumnInfo = [
            { displayType: 'function', displayingPropertyOrFn: getEmployeeCode, colHeadName: 'Emp Code' },
            //{ displayType: 'function', displayingPropertyOrFn: getEmployeeFullname, colHeadName: 'Name' },
            { displayType: 'text', displayingPropertyOrFn: 'username', colHeadName: 'Username' },
            { displayType: 'text', displayingPropertyOrFn: 'work_email', colHeadName: 'Office Email' },
            { displayType: 'function', displayingPropertyOrFn: getUserRoles, colHeadName: 'Role(s)' },
            { displayType: 'function', displayingPropertyOrFn: getUserAccStatus, colHeadName: 'Status' }
        ]

        createTable(tableUserHolderDiv, sharedTableId, users, tableColumnInfo);

        $(`#${sharedTableId}`).dataTable();

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
//const getEmployeeFullname = (userObj) => {
//    return userObj.employee_id.fullname;
//}


const getUserRoles = (userObj) => {
    let userRoles = '<div class="role-container" style="max-width: 300px;">';

    const roleColors = {
        Admin: '#2c3e50',
        Manager: '#8e44ad',
        "Assistant Manager": '#6c5ce7',
        Receptionist: '#00cec9',
        Driver: '#e67e22',
        Executive: '#1e90ff',
        Guide: '#d63031',
    };

    userObj.roles.forEach((element) => {
        const color = roleColors[element.name] || '#7f8c8d';
        userRoles += `<span class="rounded-pill text-white p-2 me-1 mb-1 d-inline-block" style="background-color: ${color}; font-weight: 500;">${element.name}</span>`;
    });

    userRoles += '</div>';
    return userRoles;
};



//to support fill main table
const getUserAccStatus = (userObj) => {
    if (userObj.acc_status) {
        return `
            <p class="text-white mx-1 px-3 py-1 my-auto d-inline-block"
               style="background-color: #2ecc71; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
               Active
            </p>`;
    } else {
        return `
            <p class="text-white mx-1 px-3 py-1 my-auto d-inline-block"
               style="background-color: #e74c3c; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
               ❌ Inactive
            </p>`;
    }
}


const getRandomColor = () => {
    return `hsl(${Math.random() * 360}, 70%, 60%)`; // Random hue, good contrast
};

//fn to ready the main form for accept values
const refreshUserForm = async () => {

    user = new Object();
    oldUser = null;

    user.roles = new Array();

    try {
        const empListWOUserAccs = await ajaxGetReq("/emp/listwithoutuseracc")
        fillMultDataIntoDynamicSelects(selectEmployee, 'Select Employee', empListWOUserAccs, 'emp_code', 'fullname')

        rolesList = await ajaxGetReq("/role/exceptadmin");
        dynamicUserRoles.innerHTML = "";
        dynamicUserRoles.classList.add("d-flex", "flex-wrap", "gap-2");

        rolesList.forEach(element => {
            let idAttribute = element.name.replace(/\s+/g, '-');

            let newInput = document.createElement('input');
            newInput.type = "checkbox";
            newInput.classList.add("btn-check");
            newInput.setAttribute('id', idAttribute);
            newInput.setAttribute('autocomplete', 'off');

            let newLabel = document.createElement('label');
            newLabel.className = "btn , btn-outline-primary";
            newLabel.setAttribute('for', idAttribute);
            newLabel.innerText = element.name;
            newLabel.style.minWidth = "100px";
            newLabel.style.textAlign = "center";
            newLabel.style.borderRadius = "8px";
            newLabel.style.transition = "all 0.3s ease-in-out";

            newInput.onchange = function () {
                if (this.checked) {
                    console.log('checked ' + element.name);
                    user.roles.push(element);
                    newLabel.style.backgroundColor = "lime";
                    newLabel.style.color = "white";
                    newLabel.style.borderColor = "green";
                } else {
                    newLabel.style.backgroundColor = "";
                    newLabel.style.color = "";
                    newLabel.style.borderColor = "";
                    console.log('un checked ' + element.name);
                    const roleIDsOnly = user.roles.map(r => r.id);
                    const indexOfCurrentPoppingElement = roleIDsOnly.indexOf(element.id);
                    if (indexOfCurrentPoppingElement != -1) {
                        user.roles.splice(indexOfCurrentPoppingElement, 1);
                    }
                }
            }

            dynamicUserRoles.appendChild(newInput);
            dynamicUserRoles.appendChild(newLabel);
        });

    } catch (error) {
        console.error("Failed to fetch user data: ", error);
    }

    document.getElementById('formUser').reset();

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

    document.getElementById("selectEmployee").disabled = false;

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
const generateWorkEmail = () => {

    const selectedEmployee = JSON.parse(document.getElementById('selectEmployee').value);

    const fullname = selectedEmployee.fullname;
    const empCode = selectedEmployee.emp_code;

    const convertedFullname = fullname.replace(/\s+/g, "").toLowerCase();

    const domain = "@yathratravels.lk";

    const craftedEmail = convertedFullname + empCode + domain;

    const inputEmailVar = document.getElementById('inputEmail');
    inputEmailVar.value = craftedEmail;
    user.work_email = inputEmailVar.value;
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

//check form errors before submit
const checkUserFormErrors = () => {
    let errors = '';

    if (user.employee_id == null) {
        errors = errors + "\nEmployee name cannot be empty \n";

    }
    if (user.username == null) {
        errors = errors + "\nUsername cannot be empty \n";

    }
    if (user.password == null) {
        errors = errors + "\nPassword cannot be empty \n";

    }

    if (user.work_email == null) {
        errors = errors + "\nEmail cannot be empty \n";

    }
    if (user.roles.length == 0) {
        errors = errors + "\nSelect at least one Role \n";

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
                    showAlertModal('suc', 'Saved Successfully');
                    document.getElementById('formUser').reset();
                    refreshUserForm();
                    buildUserTable();
                    var myEmpTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    myEmpTableTab.show();
                } else {
                    showAlertModal('err', 'Submit Failed ' + postServerResponse);
                }
            } catch (error) {
                showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
            }

        } else {
            showAlertModal('inf', 'User cancelled the task');
        }
    } else {
        showAlertModal('err', errors);
    }
}

const resetUserModal = () => {

    let editBtnModal = document.getElementById("modalUserEditBtn");
    let deleteBtnModal = document.getElementById("modalUserDeleteBtn");

    // Hide the deleted record message    
    //document.getElementById('modalEmpIfDeleted').innerText = '';
    //document.getElementById('modalEmpIfDeleted').classList.add('d-none');

    // Enable and show edit/delete buttons
    editBtnModal.disabled = false;
    deleteBtnModal.disabled = false;
    editBtnModal.style.cursor = "pointer";
    deleteBtnModal.style.cursor = "pointer";
    editBtnModal.classList.remove('d-none');
    deleteBtnModal.classList.remove('d-none');

    // Hide the recover button
    //document.getElementById('modalEmpRecoverBtn').classList.add('d-none');

}

//fn for edit button  
const openModal = (userObj) => {

    //reset the modal
    resetUserModal();

    document.getElementById('modalUserEmpCode').innerText = userObj.employee_id.emp_code || 'N/A';
    document.getElementById('modalUserEmpName').innerText = userObj.employee_id.fullname || 'N/A';
    document.getElementById('modalUserUsername').innerText = userObj.username || 'N/A';
    document.getElementById('modalUserCompanyEmail').innerText = userObj.work_email || 'N/A';

    document.getElementById('modalUserNote').innerText = userObj.note || 'N/A';
    document.getElementById('modalUserAccCreatedDate').innerText = userObj.addeddatetime || 'N/A';

    if (userObj.acc_status) {
        document.getElementById('modalUserAccStatus').innerText = "Account Is Active "
    } else {
        document.getElementById('modalUserAccStatus').innerText = "Account Is Not Active "
    }

    let userRoles = '';
    userObj.roles.forEach((element, index) => {
        if (userObj.roles.length - 1 == index) {
            userRoles = userRoles + element.name;
        }
        else {
            userRoles = userRoles + element.name + ", ";
        }
    });

    document.getElementById('modalUserRoles').innerText = userRoles || 'N/A';

    let loggedUserEmailText = document.getElementById("loggedUserCompanyEmailDisplayId").innerText;

    if (userObj.work_email == loggedUserEmailText) {

        let editBtnModal = document.getElementById("modalUserEditBtn");
        let deleteBtnModal = document.getElementById("modalUserDeleteBtn");

        editBtnModal.disabled = true;
        deleteBtnModal.disabled = true;

        editBtnModal.style.cursor = "not-allowed";
        deleteBtnModal.style.cursor = "not-allowed";

        let modalEditBtnErrMsg = document.getElementById("hoverTextModalEditBtn");
        let modalDeleteBtnErrMsg = document.getElementById("hoverTextModalDltBtn");

        editBtnModal.onmouseover = function (e) {
            modalEditBtnErrMsg.classList.remove("d-none");
            modalEditBtnErrMsg.style.left = e.pageX +'px';
            modalEditBtnErrMsg.style.top = e.pageY +'px';
        }

        editBtnModal.onmouseout = function () {
            modalEditBtnErrMsg.classList.add("d-none");
        }

        deleteBtnModal.onmouseover = function (e) {
            modalDeleteBtnErrMsg.classList.remove("d-none");
            modalDeleteBtnErrMsg.style.left = e.pageX +'px';
            modalDeleteBtnErrMsg.style.top = e.pageY +'px';
        }

        deleteBtnModal.onmouseout = function () {
            modalDeleteBtnErrMsg.classList.add("d-none");
        }

        //document.getElementById("btnUserEdit").onmouseover
    }

    // Show the modal
    $('#infoModalUser').modal('show');

};

// refill the form to edit a record
const refillUserForm = async (userObj) => {

    user = JSON.parse(JSON.stringify(userObj));
    oldUser = JSON.parse(JSON.stringify(userObj));

    try {
        empListWOUserAcc = await ajaxGetReq("/emp/listwithoutuseracc");
        empListWOUserAcc.push(user.employee_id);
        fillMultDataIntoDynamicSelects(selectEmployee, "Select Employee", empListWOUserAcc, 'emp_code', 'fullname', user.employee_id.fullname);
        inputUserName.disabled = true;
        selectEmployee.disabled = true;

        rolesList = await ajaxGetReq("/role/exceptadmin");
        dynamicUserRoles.innerHTML = "";
        //dynamicUserRoles.classList.add("d-flex", "flex-wrap", "gap-2");
        rolesList.forEach(element => {

            let idAttribute = element.name.replace(/\s+/g, '-');

            let newInput = document.createElement('input');
            newInput.type = "checkbox";
            newInput.classList.add("btn-check");
            newInput.setAttribute('id', idAttribute);
            newInput.setAttribute('autocomplete', 'off');

            let newLabel = document.createElement('label');
            newLabel.className = "btn , btn-outline-primary me-2 my-1";
            newLabel.setAttribute('for', idAttribute);
            newLabel.innerText = element.name;
            newLabel.style.minWidth = "100px";
            newLabel.style.textAlign = "center";
            newLabel.style.borderRadius = "8px";
            newLabel.style.transition = "all 0.3s ease-in-out";

            newInput.onchange = function () {
                if (this.checked) {
                    user.roles.push(element)
                    console.log('checked ' + element.name);
                    newLabel.style.backgroundColor = "lime";
                    newLabel.style.color = "white";
                    newLabel.style.borderColor = "green";
                } else {
                    newLabel.style.backgroundColor = "";
                    newLabel.style.color = "";
                    newLabel.style.borderColor = "";
                    console.log('un checked ' + element.name);
                    const roleIDsOnly = user.roles.map(r => r.id);
                    const indexOfCurrentPoppingElement = roleIDsOnly.indexOf(element.id);

                    if (indexOfCurrentPoppingElement != -1) {
                        user.roles.splice(indexOfCurrentPoppingElement, 1);
                    }
                }
            }

            const roleIDsOnly = user.roles.map(r => r.id);
            const indexOfCurrentPoppingElement = roleIDsOnly.indexOf(element.id);

            if (indexOfCurrentPoppingElement != -1) {
                newInput.checked = true;
            }

            //newDiv.appendChild(newInput);
            //newDiv.appendChild(newLabel);

            dynamicUserRoles.appendChild(newInput)
            dynamicUserRoles.appendChild(newLabel)

        });


    } catch (error) {
        console.error("Failed to fetch user data: ", error);
    }

    if (user.acc_status) {
        document.getElementById('userAccActive').checked = true;
    } else {
        document.getElementById('userAccInactive').checked = true;
    }

    inputUserName.value = user.username;
    inputEmail.value = user.work_email;

    //to admin to change pw of accounts that users forgot the pw
    //document.getElementById('inputPwd').disabled = true;
    //document.getElementById('retypePwd').disabled = true;

    document.getElementById('userAddBtn').disabled = true;
    document.getElementById('userAddBtn').style.cursor = "not-allowed";

    document.getElementById('userUpdateBtn').disabled = false;
    document.getElementById('userUpdateBtn').style.cursor = "pointer";

    $("#infoModalUser").modal("hide");

    //edit karanna nodima inna mechchara dura noya, showAlertModal ekak danna 💥💥
    //    if (privileges.privupdate) {
    //        userUpdateBtn.disabled = false;
    //        userUpdateBtn.style.cursor="pointer"
    //    } else {
    //        userUpdateBtn.disabled = true;
    //        userUpdateBtn.style.cursor="not-allowed" 
    //    }

    var myUserFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myUserFormTab.show();


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
        updates = updates + " Username will be changed to " + user.username;
    }

    if (oldUser.work_email != user.work_email) {
        updates = updates + " Email will be changed to " + user.work_email;
    }

    //roles changes possibilities (total 4)
    let newUserRoleIDsOnlyArray = user.roles.map(r => r.id);
    let oldUserRoleIDsOnlyArray = oldUser.roles.map(olur => olur.id);

    //1, in both times same number of roles are selected , but different ones
    if (user.roles.length == oldUser.roles.length) {

        //1.1 but different ones (A ---> B)
        for (let roleID of newUserRoleIDsOnlyArray) {
            if (!oldUserRoleIDsOnlyArray.includes(roleID)) {
                updates = updates + ' New Role(s) Assigned';
            }
        }

        //1.2 same roles, order changes (A,B ---> B,A)
        //use sort arr.sort((a, b) => a - b))
        let oldUserRolesSortedIDsArray = oldUserRoleIDsOnlyArray.sort((a, b) => a - b);
        let newUserRolesSortedIDsArray = newUserRoleIDsOnlyArray.sort((a, b) => a - b);

        if (oldUserRolesSortedIDsArray == newUserRolesSortedIDsArray) {
            updates = '';
        }
    }

    //2
    if (user.roles.length > oldUser.roles.length) {
        updates = updates + "Role(s) List Has Changed ";
    }

    //3
    if (user.roles.length < oldUser.roles.length) {
        updates = updates + "Role(s) List Has Changed ";
    }

    if (user.acc_status !== oldUser.acc_status) {
        updates = updates + " Status will be changed to " + user.acc_status;
    }

    return updates;
}

//fn for UPDATE btn
const updateUser = async () => {

    let errors = checkUserFormErrors();
    if (errors == '') {
        let updates = showUserValueChanges();
        if (updates == '') {
            showAlertModal('war', 'No changes detected to update')
        } else {
            let userResponse = confirm("Are you sure to proceed ? \n \n" + updates);
            if (userResponse) {

                try {
                    let putServiceResponse = await ajaxPPDRequest("/user", "PUT", user);

                    if (putServiceResponse === "OK") {
                        showAlertModal('suc', "Successfully Updated");
                        document.getElementById('formUser').reset();
                        refreshUserForm();
                        buildUserTable();
                        var myEmpTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        myEmpTableTab.show();
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
        showAlertModal('err ', errors)
    }
}

//fn for delete a record
const deleteUserRecord = async (userObj) => {

    const userConfirm = confirm('Are you sure to delete the following user account ? \n ' + userObj.username);

    if (userConfirm) {

        try {
            const deleteServerResponse = await ajaxPPDRequest("/user", "DELETE", userObj);

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

// fn for print an user record
const printUserRecord = () => {
    // Get the content from the modal
    const modalContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
            <h2 style="text-align: center; color: #007bff;">User Account Information</h2>
            <hr style="border: 1px solid #007bff; margin-bottom: 20px;">         
           
            <p><strong>Employee Code:</strong> ${document.getElementById('modalUserEmpCode').innerText || 'N/A'}</p>
            <p><strong>Employee Name:</strong> ${document.getElementById('modalUserEmpName').innerText || 'N/A'}</p>
            <p><strong>Username:</strong> ${document.getElementById('modalUserUsername').innerText || 'N/A'}</p>
            <p><strong>Email:</strong> ${document.getElementById('modalUserCompanyEmail').innerText || 'N/A'}</p>
            <p><strong>Role(s):</strong> ${document.getElementById('modalUserRoles').innerText || 'N/A'}</p>
            <p><strong>Account Created Date:</strong> ${document.getElementById('modalUserAccCreatedDate').innerText || 'N/A'}</p>
            <p><strong>Account Status:</strong> ${document.getElementById('modalUserAccStatus').innerText || 'N/A'}</p>
            <p><strong>Additional Information:</strong> ${document.getElementById('modalUserNote').innerText || 'N/A'}</p>

            <hr style="margin-top: 30px;">
            <p style="text-align: center; font-size: 12px; color: #555;">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        </div>
    `;

    // Create a new window for the print preview
    const printWindow = window.open('', '', 'width=800, height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>User Account Information</title>
                <style>
                    body { margin: 0; padding: 0; }
                    @media print {
                        h2, h4 { color: #000 !important; }
                        hr { border-color: #000 !important; }
                    }
                </style>
            </head>
            <body>${modalContent}</body>
        </html>
    `);

    // Signal that writing to the printWindow document is complete
    printWindow.document.close();

    // Trigger the print dialog
    printWindow.print();

    // Close the print window after printing
    printWindow.onafterprint = () => printWindow.close();
}
