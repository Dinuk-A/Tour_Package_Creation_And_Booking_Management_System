window.addEventListener('load', () => {
    console.log("emp js connected");
    refreshEmployeeTable();
    
})

//global var to store id of the table
let sharedTableId = "mainTableEmployee";

//to create and refresh content in main employee table
const refreshEmployeeTable = () => {

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

    // $('#mainTableEmployee').dataTable();

}

const getDesignation = (empObj) => {
    return empObj.designation_id.name;
}

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



/* settings btn ekak hadanna table walata, thiyana okkoma cols list 1 pennnawa checkbox widiyata, max 5k select krla UI eke pennanaa cols tika change krganna puluwan */