window.addEventListener('load', () => {

    buildEmployeeTable();
    refreshEmployeeForm();

})

//global var to store id of the table
let sharedTableId = "mainTableEmployee";

//to create and refresh content in main employee table
const buildEmployeeTable = async () => {

    try {
        const employees = await ajaxGetReq("/emp/all");

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'emp_code', colHeadName: 'Code' },
            { displayType: 'text', displayingPropertyOrFn: 'fullname', colHeadName: 'Full Name' },
            { displayType: 'function', displayingPropertyOrFn: showEmpDesignation, colHeadName: 'Designation' },
            { displayType: 'text', displayingPropertyOrFn: 'email', colHeadName: 'Email' },
            { displayType: 'text', displayingPropertyOrFn: 'mobilenum', colHeadName: 'Contact' },
            { displayType: 'function', displayingPropertyOrFn: showEmployeeStatus, colHeadName: 'Status' }
        ]

        createTable(tableEmployeeHolderDiv, sharedTableId, employees, tableColumnInfo);

        $(`#${sharedTableId}`).dataTable();

    } catch (error) {
        console.error("Failed to build employee table:", error);
    }

}

// fn to fill the table
const showEmpDesignation = (empObj) => {
    return empObj.designation_id.name;
}

// fn to fill the table
const showEmployeeStatus = (empObj) => {

    if (empObj.deleted_emp == null || empObj.deleted_emp == false) {
        if (empObj.emp_status == "Working") {
            return "Working"
        } else {
            return "Resigned"
        }
    } else if (empObj.deleted_emp != null && empObj.deleted_emp == true) {
        return '<p class="text-white bg-danger text-center my-0 p-2" > Deleted Record </p>'
    }
}

//fn to ready the main form for accept values
const refreshEmployeeForm = async () => {

    employee = new Object();

    document.getElementById('formEmployee').reset();

    try {
        const designations = await ajaxGetReq("/desig/all")
        fillDataIntoDynamicSelects(selectDesignation, 'Select Designation', designations, 'name');
    } catch (error) {
        console.error("Failed to fetch Designations : ", error);
    }

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inputFullName',
        'inputNIC',
        'dateDateOfBirth',
        'inputEmail',
        'inputMobile',
        'inputLand',
        'inputAddress',
        'inputNote',
        'selectDesignation',
        'selectEmployeementStatus'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    empUpdateBtn.disabled = true;
    empUpdateBtn.style.cursor = "not-allowed";

    empAddBtn.disabled = false;
    empAddBtn.style.cursor = "pointer";

    employee.emp_photo = null;
    document.getElementById('previewEmployeeImg').src = 'images/employee.png';
    document.getElementById('fileInputEmpPhoto').files = null;
    document.getElementById('previewEmployeeImg').style.border = "1px solid #ced4da";
}

//set the status as auto every time when a new form is opened
//maybe hide entire thing and display only when updating ? 💥
const setEmpStatusAuto = () => {
    document.getElementById('selectEmployeementStatus').value = 'Working';
    document.getElementById('selectEmployeementStatus').style.border = '2px solid lime';
    document.getElementById('selectEmployeementStatus').children[2].setAttribute('class', 'd-none');
    employee.emp_status = 'Working';
}

//check errors before submitting
const checkEmpFormErrors = () => {
    let errors = "";

    if (employee.fullname == null) {
        errors += "Full Name cannot be empty \n";
    }

    if (employee.nic == null) {
        errors += "NIC cannot be empty \n";
    }

    if (employee.dob == null) {
        errors += "DOB cannot be empty \n";
    }

    if (employee.gender == null) {
        errors += "Gender cannot be empty \n";
    }

    if (employee.email == null) {
        errors += "Email cannot be empty \n";
    }

    if (employee.mobilenum == null) {
        errors += "Mobile Number cannot be empty \n";
    }

    if (employee.address == null) {
        errors += "Address cannot be empty \n";
    }

    if (employee.designation_id == null) {
        errors += "Designation cannot be empty \n";
    }

    //    if (employee.emp_photo != null) {
    //        const fileInput = document.getElementById("fileInputEmpPhoto");
    //        const previewImg = document.getElementById("previewEmployeeImg");
    //        const isImageValid = imgValidatorEmpPic(fileInput, "employee", "emp_photo", previewImg);
    //
    //        if (!isImageValid) {
    //            errors += "Invalid employee image \n";
    //        }
    //    }


    return errors;
};

//to validate and bind the image 
const imgValidatorEmpPic = (fileInputID, object, imgProperty, previewId) => {
    if (fileInputID.files != null) {
        const file = fileInputID.files[0];

        // Validate file size (1 MB max)
        const maxSizeInBytes = 1 * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
            alert("The file size exceeds 1 MB. Please select a smaller file.");
            //return false;
        }

        // Validate file type (JPEG, JPG, PNG)
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            alert("Invalid file type. Only JPEG, JPG, and PNG files are allowed.");
            //return false;
        }

        // Process file and update the preview
        const fileReader = new FileReader();
        fileReader.onload = function (e) {
            previewId.src = e.target.result; // Show image preview
            window[object][imgProperty] = btoa(e.target.result); // Store Base64 data
            previewId.style.border = "2px solid lime";
        };
        fileReader.readAsDataURL(file);

        //return true;
    }
    previewId.style.border = "2px solid red";
    return false;

};

//clear uploaded image (not delete)
const clearEmpImg = () => {
    if (employee.emp_photo != null) {
        let userConfirmImgDlt = confirm("Are You Sure To Clear This Image?");
        if (userConfirmImgDlt) {
            employee.emp_photo = null;
            document.getElementById('previewEmployeeImg').src = 'images/employee.png';
            document.getElementById('fileInputEmpPhoto').files = null;
            document.getElementById('previewEmployeeImg').style.border = "1px solid #ced4da";

        } else {
            alert("User Cancelled The Deletion Task")
        }
    }
}

//fn to submit button (add button)
const addNewEmployee = async () => {

    const errors = checkEmpFormErrors();
    if (errors == '') {
        const userConfirm = confirm('Are you sure to add?');

        if (userConfirm) {
            try {
                // Await the response from the AJAX request
                const postServerResponse = await ajaxPPDRequest("/emp", "POST", employee);

                if (postServerResponse === 'OK') {
                    alert('Saved Successfully');
                    document.getElementById('formEmployee').reset();
                    refreshEmployeeForm();
                    buildEmployeeTable();
                    var myEmpTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    myEmpTableTab.show();
                } else {
                    alert('Submit Failed ' + postServerResponse);
                }
            } catch (error) {
                // Handle errors (such as network issues or server errors)
                alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
            }
        } else {
            alert('User cancelled the task');
        }
    } else {
        alert('Form has following errors:  \n' + errors);
    }
}

//fn for edit button,
//current way === this will open the same form but with filled values
const openModal = (empObj) => {

    document.getElementById('modalEmpCode').innerText = empObj.emp_code || 'N/A';
    document.getElementById('modalEmpFullName').innerText = empObj.fullname || 'N/A';
    document.getElementById('modalEmpNIC').innerText = empObj.nic || 'N/A';
    document.getElementById('modalEmpDOB').innerText = empObj.dob || 'N/A';
    document.getElementById('modalEmpPersonalEmail').innerText = empObj.email || 'N/A';
    //document.getElementById('modalEmpWorkEmail').innerText = empObj.email || 'N/A';
    document.getElementById('modalEmpMobileNum').innerText = empObj.mobilenum || 'N/A';
    document.getElementById('modalEmpLandNum').innerText = empObj.landnum || 'N/A';
    document.getElementById('modalEmpAddress').innerText = empObj.address || 'N/A';
    document.getElementById('modalEmpGender').innerText = empObj.gender || 'N/A';
    document.getElementById('modalEmpNote').innerText = empObj.note || 'N/A';
    document.getElementById('modalEmpDesignation').innerText = empObj.designation_id.name || 'N/A';
    document.getElementById('modalEmpStatus').innerText = empObj.emp_status || 'N/A';

    if (empObj.emp_photo != null) {
        document.getElementById('modalPreviewEmployeeImg').src = atob(empObj.emp_photo)
    } else {
        document.getElementById('modalPreviewEmployeeImg').src = 'images/employee.png';
    }

    if (empObj.deleted_emp) {
        document.getElementById('modalEmpIfDeleted').classList.remove('d-none');
        document.getElementById('modalEmpIfDeleted').innerHTML =
            'This is a deleted record. <br>Deleted at ' +
            new Date(empObj.deleteddatetime).toLocaleString();
        document.getElementById('modalEmpEditBtn').disabled = true;
        document.getElementById('modalEmpDeleteBtn').disabled = true;
        document.getElementById('modalEmpEditBtn').classList.add('d-none');
        document.getElementById('modalEmpDeleteBtn').classList.add('d-none');
        document.getElementById('modalEmpRecoverBtn').classList.remove('d-none');
    }

    // Show the modal
    $('#infoModalEmployee').modal('show');

};

// refill the form to edit a record
const refillEmployeeForm = async (empObj) => {

    employee = JSON.parse(JSON.stringify(empObj));
    oldEmployee = JSON.parse(JSON.stringify(empObj));

    //doc.getelebyid yanna 💥💥💥💥
    inputFullName.value = empObj.fullname;
    inputNIC.value = empObj.nic;
    inputEmail.value = empObj.email;
    inputMobile.value = empObj.mobilenum;
    inputLand.value = empObj.landnum;
    inputAddress.value = empObj.address;
    inputNote.value = empObj.note;
    dateDateOfBirth.value = empObj.dob;
    selectEmployeementStatus.value = empObj.emp_status;

    if (empObj.gender == "Male") {
        radioMale.checked = true;
    } else {
        radioFemale.checked = true;
    }

    if (employee.emp_photo != null) {
        previewEmployeeImg.src = atob(employee.emp_photo);
    } else {
        previewEmployeeImg.src = "images/employee.png";
    }

    try {
        designations = await ajaxGetReq("/desig/all");
        fillDataIntoDynamicSelects(selectDesignation, 'Select Designation', designations, 'name', empObj.designation_id.name);
    } catch (error) {
        console.error("Failed to fetch Designations : ", error);
    }

    empUpdateBtn.disabled = false;
    empUpdateBtn.style.cursor = "pointer";

    empAddBtn.disabled = true;
    empAddBtn.style.cursor = "not-allowed";

    document.getElementById('selectEmployeementStatus').style.border = '1px solid #ced4da';
    document.getElementById('selectEmployeementStatus').children[2].classList.remove('d-none');

    $("#infoModalEmployee").modal("hide");

    var myEmpFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myEmpFormTab.show();

}

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshEmployeeForm();
        }
    });
});

//show value changes before update
const showEmpValueChanges = () => {

    let updates = "";

    if (employee.fullname != oldEmployee.fullname) {
        updates = updates + " Full Name will be changed to " + employee.fullname + "\n";
    }
    if (employee.nic != oldEmployee.nic) {
        updates = updates + " NIC will be changed to " + employee.nic + "\n";
    }
    if (employee.mobilenum != oldEmployee.mobilenum) {
        updates = updates + " Mobile Number will be changed to " + employee.mobilenum + "\n";
    }
    if (employee.landnum != oldEmployee.landnum) {
        updates = updates + " Land Number will be changed to " + employee.landnum + "\n";
    }
    if (employee.email != oldEmployee.email) {
        updates = updates + " Email will be changed to " + employee.email + "\n";
    }
    if (employee.dob != oldEmployee.dob) {
        updates = updates + " DOB will be changed to " + employee.dob + "\n";
    }
    if (employee.gender != oldEmployee.gender) {
        updates = updates + " Gender will be changed to " + employee.gender + "\n";
    }
    if (employee.address != oldEmployee.address) {
        updates = updates + " Address will be changed to " + employee.address + "\n";
    }
    if (employee.designation_id.name != oldEmployee.designation_id.name) {
        updates = updates + " Designation will be changed to " + employee.designation_id.name + "\n";
    }
    if (employee.emp_status != oldEmployee.emp_status) {
        updates = updates + " Status will be changed to " + employee.emp_status + "\n";
    }
    if (employee.note != oldEmployee.note) {
        updates = updates + " Note will be changed to " + employee.note + "\n";
    }

    if (employee.emp_photo != oldEmployee.emp_photo) {
        updates = updates + " Employee Photo has changed";
    }

    return updates;
}

//fn for update button
const updateEmployee = async () => {

    const errors = checkEmpFormErrors();
    if (errors == "") {
        let updates = showEmpValueChanges();
        if (updates == "") {
            alert("No changes detected to update");
        } else {
            let userConfirm = confirm("Are you sure to proceed ? \n \n" + updates);

            if (userConfirm) {

                try {
                    let putServiceResponse = await ajaxPPDRequest("/emp", "PUT", employee);

                    if (putServiceResponse === "OK") {
                        alert("Successfully Updated");
                        document.getElementById('formEmployee').reset();
                        refreshEmployeeForm();
                        buildEmployeeTable();
                        var myEmpTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        myEmpTableTab.show();
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
        alert("Form has following errors: \n" + errors);
    }
}

//fn to delete an employee record
const deleteEmployeeRecord = async (empObj) => {
    const userConfirm = confirm("Are you sure to delete the employee " + empObj.emp_code + " ?");
    if (userConfirm) {
        try {
            const deleteServerResponse = await ajaxPPDRequest("/emp", "DELETE", empObj);

            if (deleteServerResponse === 'OK') {
                alert('Record Deleted');
                $('#infoModalEmployee').modal('hide');
                window.location.reload();
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

//restore employee record if its already deleted
// or this should call a new service to set deleted_emp as false ? 💥💥💥
const restoreEmployeeRecord = async () => {

    const userConfirm = confirm("Are you sure to recover this deleted record ?");

    if (userConfirm) {
        try {
            //mehema hari madi, me tika backend eke karanna trykaranna /restore kiyala URL ekak hadala 💥💥💥
            employee = window.currentObject;
            employee.deleted_emp = false;

            let putServiceResponse = await ajaxPPDRequest("/emp", "PUT", employee);

            if (putServiceResponse === "OK") {
                alert("Successfully Restored");
                $("#infoModalEmployee").modal("hide");

                //AN LOADING ANIMATION HERE BEFORE REFRESHES ?? 💥💥💥
                window.location.reload();

            } else {
                alert("Restore Failed \n" + putServiceResponse);
            }

        } catch (error) {
            alert('An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        alert('User cancelled the recovery task');
    }


}

// fn for print an employee record
const printEmployeeRecord = () => {
    // Get the content from the modal
    const modalContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
            <h2 style="text-align: center; color: #007bff;">Employee Information</h2>
            <hr style="border: 1px solid #007bff; margin-bottom: 20px;">

            <!-- Employee Image and Basic Info -->
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="flex: 1; text-align: center;">
                    <img src="${document.getElementById('modalPreviewEmployeeImg').src}" 
                         alt="Employee Photo" 
                         style="width: 150px; height: 150px; border-radius: 50%; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);">
                </div>
                <div style="flex: 2; padding-left: 20px;">
                    <p><strong>Full Name:</strong> ${document.getElementById('modalEmpFullName').innerText || 'N/A'}</p>
                    <p><strong>NIC:</strong> ${document.getElementById('modalEmpNIC').innerText || 'N/A'}</p>
                </div>
            </div>

            <!-- Additional Details -->
            <p><strong>Employee Code:</strong> ${document.getElementById('modalEmpCode').innerText || 'N/A'}</p>
            <p><strong>Designation:</strong> ${document.getElementById('modalEmpDesignation').innerText || 'N/A'}</p>
            <p><strong>Working Status:</strong> ${document.getElementById('modalEmpStatus').innerText || 'N/A'}</p>
            <p><strong>Gender:</strong> ${document.getElementById('modalEmpGender').innerText || 'N/A'}</p>
            <p><strong>Date of Birth:</strong> ${document.getElementById('modalEmpDOB').innerText || 'N/A'}</p>
            <p><strong>Mobile Number:</strong> ${document.getElementById('modalEmpMobileNum').innerText || 'N/A'}</p>
            <p><strong>Landline Number:</strong> ${document.getElementById('modalEmpLandNum').innerText || 'N/A'}</p>
            <p><strong>Personal Email:</strong> ${document.getElementById('modalEmpPersonalEmail').innerText || 'N/A'}</p>
            <p><strong>Address:</strong> ${document.getElementById('modalEmpAddress').innerText || 'N/A'}</p>
            <p><strong>Additional Details:</strong> ${document.getElementById('modalEmpNote').innerText || 'N/A'}</p>

            <hr style="margin-top: 30px;">
            <p style="text-align: center; font-size: 12px; color: #555;">Generated on: 
               ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        </div>
    `;

    // Create a new window for the print preview
    const printWindow = window.open('', '', 'width=800, height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Employee Information</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                        color: #333;
                    }
                    h2 {
                        color: #007bff;
                        text-align: center;
                    }
                    p {
                        margin: 5px 0;
                        font-size: 14px;
                    }
                    img {
                        display: block;
                        margin: auto;
                    }
                    hr {
                        border: none;
                        border-top: 1px solid #007bff;
                    }
                    @media print {
                        body {
                            margin: 0;
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>${modalContent}</body>
        </html>
    `);

    // Indicate that writing to the printWindow.document is complete
    printWindow.document.close();

    // Trigger the print dialog
    printWindow.print();

    // Close the print window after printing
    printWindow.onafterprint = () => printWindow.close();
};


// fn for print entire table 💥💥💥

//check privileges before all 💥💥💥 


/* in print > settings btn ekak hadanna table walata, thiyana okkoma cols list 1 pennnawa checkbox widiyata, max 5k select krla UI eke pennanaa cols tika change krganna puluwan 💥💥💥 */