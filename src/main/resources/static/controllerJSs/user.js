window.addEventListener('load', () => {

    buildUserTable();

})

//global var to store id of the table
let sharedTableId = "mainTableUser";

//to create and refresh content in main employee table
const buildUserTable = () => {

    users = ajaxGetReq("/user/all");

    const tableColumnInfo = [
        { displayType: 'function', displayingPropertyOrFn: getEmployeeFullname, colHeadName: 'Employee' },
        { displayType: 'text', displayingPropertyOrFn: 'username', colHeadName: 'Username' },
        { displayType: 'text', displayingPropertyOrFn: 'email', colHeadName: 'Email' },
        { displayType: 'function', displayingPropertyOrFn: getRoles, colHeadName: 'Role(s)' },
        { displayType: 'function', displayingPropertyOrFn: getUserStatus, colHeadName: 'Status' }
    ]

    createTable(tableHolderDiv, sharedTableId, users, tableColumnInfo);

    $(`#${sharedTableId}`).dataTable();
    // Initialize DataTables
    //  $(`#${sharedTableId}`).DataTable({
    //     destroy: true, // Ensure any existing instance is destroyed
    // });

}