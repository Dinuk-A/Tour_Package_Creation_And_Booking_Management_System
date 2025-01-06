window.addEventListener('load', () => {

    buildEmployeeTable();
    refreshEmployeeForm();

})

//global var to store id of the table
let sharedTableId = "mainTableEmployee";

//to create and refresh content in main employee table
const buildEmployeeTable = () => {

    employees = ajaxGetReq("/emp/all");

    const tableColumnInfo = [
        { displayType: 'text', displayingPropertyOrFn: 'emp_code', colHeadName: 'Code' },
        { displayType: 'text', displayingPropertyOrFn: 'fullname', colHeadName: 'Full Name' },
        { displayType: 'text', displayingPropertyOrFn: 'email', colHeadName: 'Email' },
        { displayType: 'text', displayingPropertyOrFn: 'mobilenum', colHeadName: 'Contact' },
        { displayType: 'function', displayingPropertyOrFn: getDesignation, colHeadName: 'Designation' },
        { displayType: 'function', displayingPropertyOrFn: getEmployeeStatus, colHeadName: 'Status' }
    ]

    createTable(tableHolderDiv, sharedTableId, employees, tableColumnInfo);

    $('#mainTableEmployee').dataTable();
    // Initialize DataTables
    //  $(`#${sharedTableId}`).DataTable({
    //     destroy: true, // Ensure any existing instance is destroyed
    // });

}

// fn to fill the table
const getDesignation = (empObj) => {
    return empObj.designation_id.name;
}

// fn to fill the table
const getEmployeeStatus = (empObj) => {

    if (!empObj.emp_isdeleted) {
        if (empObj.emp_status) {
            return "working"
        } else {
            return "Resigned"
        }
    } else {
        return "Deleted Record"
    }

}

//fn to ready the main form for accept values
const refreshEmployeeForm = () => {

    employee = new Object();

    document.getElementById('formEmployee').reset();

    designations = ajaxGetReq("/desig/all")
    fillDataIntoDynamicDropDowns(selectDesignation, 'Select Designation', designations, 'name')

    const inputTagsIds = [
        inputFullName,
        inputNIC,
        dateDateOfBirth,
        inputEmail,
        inputMobile,
        inputLand,
        inputAddress,
        inputNote,
        selectDesignation
    ];

    inputTagsIds.forEach((field) => {
        field.style.border = "1px solid #ced4da";
    });

    buildEmployeeTable();

    empUpdateBtn.disabled = true;
    empUpdateBtn.style.cursor = "not-allowed";

}

//check errors before submitting
const checkFormErrors = () => {

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
const btnAddEmp = () => {

    const errors = checkFormErrors();

    if (errors == '') {
        const userConfirm = confirm("Are You Sure To Add ?\n " + employee.fullname);

        if (userConfirm) {

            let postServiceReqResponse;
            $.ajax("/emp", {
                type: "POST",
                data: JSON.stringify(employee),
                contentType: "application/json",
                async: false,
                success: function (data) {
                    console.log("success" + data);
                    postServiceReqResponse = data;
                },
                error: function (responseObj) {
                    console.log("fail" + responseObj);
                    postServiceReqResponse = responseObj;
                }
            });
            if (postServiceReqResponse == "OK") {
                alert('Succesfully Saved !!!')
                buildEmployeeTable();
                formEmployee.reset();
                refreshEmployeeForm();
                $("#modalEmployeeAdd").modal("hide");
            } else {
                alert("post service failed \n " + postServiceReqResponse)
            }

        }
    } else {
        alert('form has following errors... \n \n' + errors)
    }


}

//fn for edit button,
//current way === this will open the same form but with filled values
const btnEditEmp = (empObj) => {

    $('#modalEmployeeAdd').modal('show');


}

//show updated values
//update btn
//dlt btn
//print btn
//print record
//img validator (should be a common fn)
//clear uploaded image (not delete)

//check privileges before all 


/* settings btn ekak hadanna table walata, thiyana okkoma cols list 1 pennnawa checkbox widiyata, max 5k select krla UI eke pennanaa cols tika change krganna puluwan */