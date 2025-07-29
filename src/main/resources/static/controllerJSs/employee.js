window.addEventListener('load', () => {

    buildEmployeeTable();
    refreshEmployeeForm();
    restrictBirthDays();

})

document.addEventListener("DOMContentLoaded", function () {
    controlSidebarLinks();
});

//global var to store id of the table
let sharedTableId = "mainTableEmployee";

//to create and refresh content in main employee table
const buildEmployeeTable = async () => {

    try {
        const employees = await ajaxGetReq("/emp/exceptadmin");

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'emp_code', colHeadName: 'Code' },
            { displayType: 'text', displayingPropertyOrFn: 'fullname', colHeadName: 'Full Name' },
            { displayType: 'function', displayingPropertyOrFn: showEmpDesignation, colHeadName: 'Designation' },
            { displayType: 'text', displayingPropertyOrFn: 'email', colHeadName: 'Email' },
            { displayType: 'text', displayingPropertyOrFn: 'mobilenum', colHeadName: 'Contact' },
            { displayType: 'function', displayingPropertyOrFn: showEmployeeStatus, colHeadName: 'Status' }
        ]

        createTable(tableEmployeeHolderDiv, sharedTableId, employees, tableColumnInfo);

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
        console.error("Failed to build employee table:", error);
    }

}

// fn to fill the table
const showEmpDesignationOri = (empObj) => {
    return empObj.designation_id.name;
}

const showEmpDesignation = (empObj) => {
    const designation = empObj.designation_id.name;
    let bgColor;

    switch (designation) {
        case "Admin":
            bgColor = "#2c3e50";
            break;
        case "Manager":
            bgColor = "#8e44ad";
            break;
        case "Assistant Manager":
            bgColor = "#6c5ce7";
            break;
        case "Receptionist":
            bgColor = "#00cec9";
            break;
        case "Driver":
            bgColor = "#e67e22";
            break;
        case "Executive":
            bgColor = "#1e90ff";
            break;
        case "Guide":
            bgColor = "#d63031";
            break;
        default:
            bgColor = "#7f8c8d";
    }

    return `
        <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
           style="background-color: ${bgColor}; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
           ${designation}
        </p>`;
};

const showEmployeeStatus = (empObj) => {

    if (empObj.deleted_emp == null || empObj.deleted_emp == false) {
        if (empObj.emp_status == "Working") {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #27ae60; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Working
                </p>`;
        } else {
            return `
                <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
                   style="background-color: #f39c12; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                   Resigned
                </p>`;
        }
    } else if (empObj.deleted_emp != null && empObj.deleted_emp == true) {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #e74c3c; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Deleted Record
            </p>`;
    }
}

//fn to ready the main form for accept values
const refreshEmployeeForm = async () => {

    employee = new Object();

    document.getElementById('formEmployee').reset();

    try {
        const designations = await ajaxGetReq("/desig/exceptadmin")
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

    inputNIC.disabled = false;

    empUpdateBtn.disabled = true;
    empUpdateBtn.style.cursor = "not-allowed";

    empAddBtn.disabled = false;
    empAddBtn.style.cursor = "pointer";

    empFormResetBtn.classList.remove('d-none');

    employee.emp_photo = null;
    document.getElementById('previewEmployeeImg').src = 'images/employee.png';
    document.getElementById('fileInputEmpPhoto').files = null;
    document.getElementById('previewEmployeeImg').style.border = "1px solid #ced4da";

    document.getElementById('selectEmployeementStatus').children[2].removeAttribute('class', 'd-none');

}

//only can select bdays before 16 years
const restrictBirthDays = () => {
    let dateInput = document.getElementById("dateDateOfBirth");

    if (dateInput) {
        let today = new Date();
        let maxYear = today.getFullYear() - 16; // 16 years before today
        let minYear = 1950;

        dateInput.min = `${minYear}-01-01`;
        dateInput.max = `${maxYear}-12-31`;
    }
}

//set the status as auto every time when a new form is opened
const setEmpStatusAuto = () => {
    const selectEmployeementStatusEle = document.getElementById('selectEmployeementStatus');
    selectEmployeementStatusEle.value = 'Working';
    selectEmployeementStatusEle.style.border = '2px solid lime';
    selectEmployeementStatusEle.children[2].setAttribute('class', 'd-none');
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
            showAlertModal('war', 'The file size exceeds 1 MB. Please select a smaller file.');
            //return false;
        }

        // Validate file type (JPEG, JPG, PNG)
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            showAlertModal('war', "Invalid file type. Only JPEG, JPG, and PNG files are allowed.");
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
            showAlertModal("inf", "User Cancelled The Deletion Task")
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
                    showAlertModal('suc', 'Saved Successfully');
                    document.getElementById('formEmployee').reset();
                    refreshEmployeeForm();
                    buildEmployeeTable();
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
        showAlertModal('war', errors);
    }
}

//clear modal content without refreshing , to aid show new content in modal
const resetModal = () => {

    // Hide the deleted record message    
    document.getElementById('modalEmpIfDeleted').innerText = '';
    document.getElementById('modalEmpIfDeleted').classList.add('d-none');

    // Enable and show edit/delete buttons
    document.getElementById('modalEmpEditBtn').disabled = false;
    document.getElementById('modalEmpDeleteBtn').disabled = false;
    document.getElementById('modalEmpEditBtn').classList.remove('d-none');
    document.getElementById('modalEmpDeleteBtn').classList.remove('d-none');

    // Hide the recover button
    document.getElementById('modalEmpRecoverBtn').classList.add('d-none');

}

//fn for edit button,
const openModal = (empObj) => {

    resetModal();

    document.getElementById('modalEmpCode').innerText = empObj.emp_code || 'N/A';
    document.getElementById('modalEmpFullName').innerText = empObj.fullname || 'N/A';
    document.getElementById('modalEmpNIC').innerText = empObj.nic || 'N/A';
    document.getElementById('modalEmpDOB').innerText = empObj.dob || 'N/A';
    document.getElementById('modalEmpPersonalEmail').innerText = empObj.email || 'N/A';
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

    inputNIC.disabled = true;

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
        designations = await ajaxGetReq("/desig/exceptadmin");
        fillDataIntoDynamicSelects(selectDesignation, 'Select Designation', designations, 'name', empObj.designation_id.name);
    } catch (error) {
        console.error("Failed to fetch Designations : ", error);
    }

    empUpdateBtn.disabled = false;
    empUpdateBtn.style.cursor = "pointer";

    empAddBtn.disabled = true;
    empAddBtn.style.cursor = "not-allowed";

    empFormResetBtn.classList.add('d-none');

    document.getElementById('selectEmployeementStatus').style.border = '1px solid #ced4da';
    //document.getElementById('selectEmployeementStatus').children[2].classList.remove('d-none');

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
            showAlertModal('war', "No changes detected to update");
        } else {
            let userConfirm = confirm("Are you sure to proceed ? \n \n" + updates);

            if (userConfirm) {

                try {
                    let putServiceResponse = await ajaxPPDRequest("/emp", "PUT", employee);

                    if (putServiceResponse === "OK") {
                        showAlertModal('suc', "Successfully Updated");
                        document.getElementById('formEmployee').reset();
                        refreshEmployeeForm();
                        buildEmployeeTable();
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
        showAlertModal('err', errors);
    }
}

//fn to delete an employee record
const deleteEmployeeRecord = async (empObj) => {
    const userConfirm = confirm("Are you sure to delete the employee " + empObj.emp_code + " ?");
    if (userConfirm) {
        try {
            const deleteServerResponse = await ajaxPPDRequest("/emp", "DELETE", empObj);

            if (deleteServerResponse === 'OK') {
                showAlertModal('inf', 'Record Deleted');
                $('#infoModalEmployee').modal('hide');
                window.location.reload();
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
                showAlertModal('suc', "Successfully Restored");
                $("#infoModalEmployee").modal("hide");

                //AN LOADING ANIMATION HERE BEFORE REFRESHES ?? 💥💥💥
                window.location.reload();

            } else {
                showAlertModal('err', "Restore Failed \n" + putServiceResponse);
            }

        } catch (error) {
            showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
        }
    } else {
        showAlertModal('inf', 'User cancelled the recovery task');
    }
}

// fn for print an employee record
const printEmployeeRecord = () => {

    const empFullName = document.getElementById('modalEmpFullName').innerText || 'Employee';

    // get the content from the modal
    const modalContent = `
<div class="container my-3 p-3 border border-primary rounded shadow-sm">
    <h2 class="text-center text-primary mb-3">Employee Information</h2>
    <hr class="border border-primary border-2">

    <!-- Employee Image and Basic Info -->
    <div class="row mb-4">
        <div class="col-md-4 text-center">
            <img src="${document.getElementById('modalPreviewEmployeeImg').src}" 
                 alt="Employee Photo" 
                 class="img-thumbnail rounded-circle border border-secondary"
                 style="width: 150px; height: 150px;">
        </div>
        <div class="col-md-8">
            <p><strong>Full Name:</strong> ${empFullName}</p>
            <p><strong>NIC:</strong> ${document.getElementById('modalEmpNIC').innerText || 'N/A'}</p>
        </div>
    </div>

    <!-- Additional Details -->
    <div class="mb-3">
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
    </div>

    <hr class="mt-4 border border-primary">

    <p class="text-center text-muted small">Generated on: 
       ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
</div>
`;

    // a new window for the print preview
    const printWindow = window.open('', '', 'width=800, height=600');
    const printableTitle = `Employee_${empFullName.trim().replace(/\s+/g, '_')}`;

    printWindow.document.write(`
<html>
    <head>
        <title>${printableTitle}</title>
        <!-- link bootstrap css -->
        <link rel="stylesheet" href="../libs/bootstrap-5.2.3/css/bootstrap.min.css">
        <!-- link bootstrap icons -->
        <link rel="stylesheet" href="../libs/bootstrap-icons-1.11.3/font/bootstrap-icons.css">
        <!-- bootstrap js -->
        <script src="../libs/bootstrap-5.2.3/js/bootstrap.bundle.min.js"></script>
        <style>
            body {
                margin: 0;
                padding: 10px;
                font-family: Arial, sans-serif;
                background-color: #f8f9fa;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    background-color: white;
                }
                .shadow-sm {
                    box-shadow: none !important;
                }
            }
        </style>
    </head>
    <body>${modalContent}</body>
</html>
`);

    printWindow.document.close();

    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();

        setTimeout(() => {
            printWindow.close();
        }, 1000);
    };


};

//ORIGINAL 💥💥💥 NOT WORKING
//make the same value as title of the doc
//printWindow.document.title = printableTitle;

// indicate that writing to the printWindow.document is complete
//printWindow.document.close();

// Trigger the print dialog
//printWindow.print();

// Close the print window after printing (original NOT WORKING)
//printWindow.onafterprint = () => printWindow.close();

//force close after a sec
//setTimeout(() => {
//    printWindow.close();
//}, 1000)


/* setTimeout(() => {
   newWindow.stop();  //load wena eka stop karanawa
   newWindow.print();   //eke print option eka call karanawa
   newWindow.close();  //then close after click cancel button
}, 1000);
*/




// fn for print entire table 💥💥💥

//check privileges before all 💥💥💥 


/* in print > settings btn ekak hadanna table walata, thiyana okkoma cols list 1 pennnawa checkbox widiyata, max 5k select krla UI eke pennanaa cols tika change krganna puluwan 💥💥💥 */