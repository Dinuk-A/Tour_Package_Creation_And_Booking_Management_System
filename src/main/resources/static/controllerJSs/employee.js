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
            { displayType: 'function', displayingPropertyOrFn: getDesignation, colHeadName: 'Designation' },
            { displayType: 'text', displayingPropertyOrFn: 'email', colHeadName: 'Email' },
            { displayType: 'text', displayingPropertyOrFn: 'mobilenum', colHeadName: 'Contact' },
            { displayType: 'function', displayingPropertyOrFn: getEmployeeStatus, colHeadName: 'Status' }
        ]

        createTable(tableEmployeeHolderDiv, sharedTableId, employees, tableColumnInfo);

        $(`#${sharedTableId}`).dataTable();

        // Initialize DataTables
        //  $(`#${sharedTableId}`).DataTable({
        //     destroy: true, // Ensure any existing instance is destroyed
        // });

    } catch (error) {
        console.error("Failed to refresh employee table:", error);
        console.log("*****************");
        console.error("jqXHR:", error.jqXHR);
        console.error("Status:", error.textStatus);
        console.error("Error Thrown:", error.errorThrown);
    }

}

// fn to fill the table
const getDesignation = (empObj) => {
    return empObj.designation_id.name;
}

// fn to fill the table
const getEmployeeStatus = (empObj) => {

    if (empObj.deleteddatetime == "" || empObj.deleteddatetime == null) {
        if (empObj.emp_status == "Working") {
            return "Working"
        } else {
            return "Resigned"
        }
    } else {
        return "Deleted Record"
    }


}

//fn to ready the main form for accept values
const refreshEmployeeForm = async() => {

    employee = new Object();

    document.getElementById('formEmployee').reset();

    const designations =await ajaxGetReq("/desig/all")
    fillDataIntoDynamicSelects(selectDesignation, 'Select Designation', designations, 'name')

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

    //buildEmployeeTableNew();

}

//check errors before submitting
const checkEmpFormErrors = () => {

    let errors = "";

    if (employee.fullname == null) {
        errors = errors + "Full Name cannot be empty \n";
    }

    if (employee.nic == null) {
        errors = errors + "NIC cannot be empty \n";
    }

    if (employee.dob == null) {
        errors = errors + "DOB cannot be empty \n";
    }

    if (employee.gender == null) {
        errors = errors + "Gender cannot be empty \n";
    }

    if (employee.email == null) {
        errors = errors + "Email cannot be empty \n";
    }

    if (employee.mobilenum == null) {
        errors = errors + "Mobile Number cannot be empty \n"
    }

    if (employee.address == null) {
        errors = errors + "Address cannot be empty \n"
    }

    if (employee.designation_id == null) {
        errors = errors + "Designation cannot be empty \n"
    }

    // if (employee.emp_status == null) {
    //     errors = errors + "Employee Status cannot be empty \n"
    // }

    return errors;

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
                    alert('Saved successfully');
                    buildEmployeeTableNew();
                    formEmployee.reset();
                    refreshEmployeeForm();
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
        alert('Form has following errors: ' + errors);
    }
};

//fn for edit button,
//current way === this will open the same form but with filled values
const openModal = (empObj) => {
    // Populate Personal Details
    document.getElementById('modalEmpCode').innerText = empObj.emp_code || 'N/A';
    document.getElementById('modalEmpFullName').innerText = empObj.fullname || 'N/A';
    document.getElementById('modalEmpNIC').innerText = empObj.nic || 'N/A';
    document.getElementById('modalEmpDOB').innerText = empObj.dob || 'N/A';

    // Populate Contact Information
    document.getElementById('modalEmpEmail').innerText = empObj.email || 'N/A';
    document.getElementById('modalEmpMobileNum').innerText = empObj.mobilenum || 'N/A';
    document.getElementById('modalEmpLandNum').innerText = empObj.landnum || 'N/A';
    document.getElementById('modalEmpAddress').innerText = empObj.address || 'N/A';

    // Populate Additional Information
    document.getElementById('modalEmpGender').innerText = empObj.gender || 'N/A';
    document.getElementById('modalEmpNote').innerText = empObj.note || 'N/A';

    // Show the modal
    $('#infoModal').modal('show');
};


// refill the form to edit a record
const refillEmployeeForm = async (empObj) => {

    //mewata access modifires danna anthimata
    employee = JSON.parse(JSON.stringify(empObj));
    oldEmployee = JSON.parse(JSON.stringify(empObj));

    inputFullName.value = empObj.fullname;
    inputNIC.value = empObj.nic;
    inputEmail.value = empObj.email;
    inputMobile.value = empObj.mobilenum;
    inputLand.value = empObj.landnum;
    inputAddress.value = empObj.address;
    inputNote.value = empObj.note;
    dateDateOfBirth.value = empObj.dob;

    //meka hithanna delete ekatath ekkma logic ekak
    //  selectEmployeementStatus.value

    if (empObj.gender == "Male") {
        radioMale.checked = true;
    } else {
        radioFemale.checked = true;
    }

    designations = await ajaxGetReq("/desig/all");
    fillDataIntoDynamicSelects(selectDesignation, 'Select Designation', designations, 'name', empObj.designation_id.name);

    empUpdateBtn.disabled = false;
    empUpdateBtn.style.cursor = "pointer";

    empAddBtn.disabled = true;
    empAddBtn.style.cursor = "not-allowed";

    $("#infoModal").modal("hide");

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
const showValueChanges = () => {

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

    return updates;
}

//fn for update button
const updateEmployee = async () => {

    const errors = checkEmpFormErrors();
    if (errors == "") {
        let updates = showValueChanges();
        if (updates == "") {
            alert("No changes detected to update");
        } else {
            let userConfirm = confirm("Are you sure to proceed ? \n \n" + updates);

            if (userConfirm) {

                try {
                    let putServiceResponse = await ajaxPPDRequest("/emp", "PUT", employee);

                    if (putServiceResponse === "OK") {
                        alert("Successfully Updated");
                        buildEmployeeTableNew();
                        formEmployee.reset();
                        refreshEmployeeForm()

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

// print employee record
const printEmployeeRecord = () => {
    // Get the content from the modal
    const modalContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
            <h2 style="text-align: center; color: #007bff;">Employee Information</h2>
            <hr style="border: 1px solid #007bff; margin-bottom: 20px;">

            <!-- Personal Details -->
            <h4 style="color: #333;">Personal Details</h4>
            <p><strong>Employee Code:</strong> ${document.getElementById('modalEmpCode').innerText || 'N/A'}</p>
            <p><strong>Full Name:</strong> ${document.getElementById('modalEmpFullName').innerText || 'N/A'}</p>
            <p><strong>NIC:</strong> ${document.getElementById('modalEmpNIC').innerText || 'N/A'}</p>
            <p><strong>Date of Birth:</strong> ${document.getElementById('modalEmpDOB').innerText || 'N/A'}</p>

            <!-- Contact Information -->
            <h4 style="color: #333;">Contact Information</h4>
            <p><strong>Email:</strong> ${document.getElementById('modalEmpEmail').innerText || 'N/A'}</p>
            <p><strong>Mobile Number:</strong> ${document.getElementById('modalEmpMobileNum').innerText || 'N/A'}</p>
            <p><strong>Landline Number:</strong> ${document.getElementById('modalEmpLandNum').innerText || 'N/A'}</p>
            <p><strong>Address:</strong> ${document.getElementById('modalEmpAddress').innerText || 'N/A'}</p>

            <!-- Additional Information -->
            <h4 style="color: #333;">Additional Information</h4>
            <p><strong>Gender:</strong> ${document.getElementById('modalEmpGender').innerText || 'N/A'}</p>
            <p><strong>Note:</strong> ${document.getElementById('modalEmpNote').innerText || 'N/A'}</p>

            <hr style="margin-top: 30px;">
            <p style="text-align: center; font-size: 12px; color: #555;">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        </div>
    `;

    // Create a new window for the print preview
    const printWindow = window.open('', '', 'width=800, height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Employee Information</title>
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

    //ignals that writing to the printWindow.document (the new tab or popup window where the printable content is written) is complete
    printWindow.document.close();

    // Trigger the print dialog
    printWindow.print();

    // Close the print window after printing
    printWindow.onafterprint = () => printWindow.close();
};


//print btn
//print record


//check privileges before all 


/* settings btn ekak hadanna table walata, thiyana okkoma cols list 1 pennnawa checkbox widiyata, max 5k select krla UI eke pennanaa cols tika change krganna puluwan */