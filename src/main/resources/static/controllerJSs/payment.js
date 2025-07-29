window.addEventListener('load', () => {

    buildPaymentTable();
    refreshPaymentForm();

})

document.addEventListener("DOMContentLoaded", function () {
    controlSidebarLinks();
});

//global var to store id of the table
let sharedTableId = "mainTablePayment";

//to create and refresh content in main payment table
const buildPaymentTable = async () => {

    try {
        const payments = await ajaxGetReq("/payment/all");

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'emp_code', colHeadName: 'Code' },
            { displayType: 'text', displayingPropertyOrFn: 'fullname', colHeadName: 'Full Name' },
            { displayType: 'function', displayingPropertyOrFn: showEmpDesignation, colHeadName: 'Designation' },
            { displayType: 'text', displayingPropertyOrFn: 'email', colHeadName: 'Email' },
            { displayType: 'text', displayingPropertyOrFn: 'mobilenum', colHeadName: 'Contact' },
            { displayType: 'function', displayingPropertyOrFn: showPaymentStatus, colHeadName: 'Status' }
        ]

        createTable(tablePaymentHolderDiv, sharedTableId, payments, tableColumnInfo);

        $(`#${sharedTableId}`).dataTable({
            destroy: true, // Allows re-initialization
            searching: false, // Remove the search bar
            info: false, // Show entries count
            pageLength: 10, // Number of rows per page
            ordering: false  ,// Remove up and down arrows
            lengthChange: false // Disable ability to change the number of rows
            // dom: 't', // Just show the table (t) with no other controls
        });

    } catch (error) {
        console.error("Failed to build payment table:", error);
    }

}