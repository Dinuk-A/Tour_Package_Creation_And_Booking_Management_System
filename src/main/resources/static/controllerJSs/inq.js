window.addEventListener('load', () => {

    refreshInquiryForm();
    refreshInqFollowupSection();
    handleTableCreation();
    handleDateFields();
    refillFilterExecutives();
});

//defined in common fn
document.addEventListener("DOMContentLoaded", function () {
    controlSidebarLinks();
});

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshInquiryForm();
            refreshInqFollowupSection();
            document.getElementById('inqStatusFilter').value = 'All';

        }
    });
});

// make max selectable time now
const setMaxTimeToNow = () => {
    const now = new Date();

    //first convert to a string, then add leading zeros if needed
    //9 >> 09
    //14>>>14
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    //format the time as HH:MM
    const maxTime = `${hours}:${minutes}`;

    const timeInput = document.getElementById('inqRecievedTime');
    timeInput.setAttribute('max', maxTime);
    timeInput.value = maxTime;
}

//fn to get client by email and show the existing client notice
const getClientByEmail = async (emailValue) => {

    if (emailValue || emailValue.trim() !== "") {

        console.log("Fetching client by email:", emailValue);

        //call cx filter by email
        let custsByEmail = null;

        try {
            custsByEmail = await ajaxGetReq("/client/byemail?email=" + emailValue);
            console.log("Clients fetched by email:", custsByEmail);
        } catch (error) {
            console.error("Error fetching clients by email:", error);
        }

        const existingClientNotice = document.getElementById('existingClientNotice');
        const existingClientRegId = document.getElementById('existingClientRegId');

        if (custsByEmail && custsByEmail.length > 0) {
            existingClientNotice.classList.remove('d-none');
            existingClientRegId.classList.remove('d-none');
            existingClientRegId.textContent = `Customer ID: ${custsByEmail[0].clientcode || 'N/A'}`;

        } else {
            existingClientNotice.classList.add('d-none');
            existingClientRegId.classList.add('d-none');

        }
    }
}

//handle min max of date fields
const handleDateFields = () => {

    const todayRecievedDate = new Date().toISOString().split('T')[0];
    const recievedDateInput = document.getElementById('inqRecievedDate');
    recievedDateInput.setAttribute('max', todayRecievedDate);
    recievedDateInput.value = todayRecievedDate;

    const approxStartDateInput = document.getElementById('inqApproxStartDate');
    const today = new Date();
    const minDate = new Date(today.setDate(today.getDate() + 5));
    const formattedDate = minDate.toISOString().split('T')[0];
    approxStartDateInput.setAttribute('min', formattedDate);

}

//to minmize the api calls, get all emps at once, then collect and show the empid and name from that list
let allEmployeesMap = {};
const loadAllEmployees = async () => {

    const allEmps = await ajaxGetReq("/emp/allbasic");

    allEmps.forEach(emp => {
        allEmployeesMap[emp.id] = emp;
    });
};

// refill the filter select element
const refillFilterExecutives = async () => {

    let inqOperators = [];

    try {
        inqOperators = await ajaxGetReq("/emp/active/inqoperators");

        const allOption = {
            id: -10,
            fullname: "All Users"
        };
        inqOperators.unshift(allOption);

        fillDataIntoDynamicSelects(assignedUserFilter, 'Please Select an Executive', inqOperators, 'fullname');

    } catch (error) {
        console.error("Error fetching inquiry operators for filter:", error);
    }
};

//handle tables type
const handleTableCreation = () => {
    const rolesRaw = document.getElementById('userRolesArraySection').textContent;
    console.log("Raw roles text:", rolesRaw);

    const roles = JSON.parse(rolesRaw);
    console.log("Parsed roles:", roles);

    if (roles.includes("System_Admin") || roles.includes("Manager") || roles.includes("Assistant Manager")) {
        //document.getElementById('assignedUserFilterDiv').style.display = "block";
        buildAllInqTable();
    } else if (roles.includes("Executive")) {
        console.log("else running");
        //document.getElementById('assignedUserFilterDiv').style.display = "none";
        buildPersonalInqTable();
    }
}

//global var to store id of the table
let sharedTableIdMainTbl = "mainTableInquiry";
let sharedTableIdPersonalTbl = "personalTableInquiry";

let assignedInqs = [];
let allInqs = [];

//this table will show all the inquiries,all statuses, all assigned users
const buildAllInqTable = async () => {

    try {
        await loadAllEmployees();
        allInqs = await ajaxGetReq("/inq/all");

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'inqcode', colHeadName: 'Code' },
            { displayType: 'function', displayingPropertyOrFn: showInquirySource, colHeadName: 'Source' },
            { displayType: 'function', displayingPropertyOrFn: showRecievedTimeStamp, colHeadName: 'Recieved Time' },
            { displayType: 'function', displayingPropertyOrFn: showInquiryStatus, colHeadName: 'Status' },
            { displayType: 'function', displayingPropertyOrFn: showAssignedEmployee, colHeadName: 'Assigned to' }
        ]

        createTable(tableHolderDiv, sharedTableIdMainTbl, allInqs, tableColumnInfo);

        $(`#${sharedTableIdMainTbl}`).dataTable();

    } catch (error) {
        console.error("Failed to build main inq table:", error);
    }
}

//this table will show all the assigned inquiries of the user
const buildPersonalInqTable = async () => {

    const userEmpId = document.getElementById('loggedUserEmpIdSectionId').textContent;
    console.log(userEmpId);

    try {
        assignedInqs = await ajaxGetReq("/inq/personal?empid=" + userEmpId);

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'inqcode', colHeadName: 'Code' },
            { displayType: 'function', displayingPropertyOrFn: showInquirySource, colHeadName: 'Source' },
            { displayType: 'function', displayingPropertyOrFn: showRecievedTimeStamp, colHeadName: 'Recieved Time' },
            { displayType: 'function', displayingPropertyOrFn: showInquiryStatus, colHeadName: 'Status' }
        ]

        createTable(tableHolderDiv, sharedTableIdPersonalTbl, assignedInqs, tableColumnInfo);

        $(`#${sharedTableIdPersonalTbl}`).dataTable({
            destroy: true, // Allows re-initialization
            searching: false, // Remove the search bar
            info: false, // Show entries count
            pageLength: 10, // Number of rows per page
            ordering: false,// Remove up and down arrows
            lengthChange: false // Disable ability to change the number of rows
            // dom: 't', // Just show the table (t) with no other controls
        });

    } catch (error) {
        console.error("Failed to build personal inq table:", error);
    }
}

//to fill table with inq stts
const showInquiryStatus = (inqObj) => {
    if (inqObj.inq_status === "New") {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #34495e; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               New Inquiry
            </p>`;
    } else if (inqObj.inq_status === "Assigned") {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #2980b9; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Assigned to Employee
            </p>`;
    } else if (inqObj.inq_status === "Working") {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #16a085; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Processing Inquiry
            </p>`;
    } else if (inqObj.inq_status === "Confirmed") {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #27ae60; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Client Confirmed Booking
            </p>`;
    } else if (inqObj.inq_status === "Closed") {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #7f8c8d; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Inquiry Closed
            </p>`;
    } else if (inqObj.inq_status === "ifDeleted") {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #c0392b; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Deleted
            </p>`;
    } else {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #95a5a6; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Unknown Status
            </p>`;
    }
};

// /to fill table with inq source
const showInquirySource = (inqObj) => {
    if (inqObj.inqsrc === "Website") {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #2c3e50; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Website
            </p>`;
    } else if (inqObj.inqsrc === "Phone Call") {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #8e44ad; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Phone Call
            </p>`;
    } else if (inqObj.inqsrc === "Email") {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #2980b9; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Email
            </p>`;
    } else if (inqObj.inqsrc === "In-person") {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #d35400; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               In-person
            </p>`;
    } else {
        return `
            <p class="text-white text-center px-3 py-1 my-auto d-inline-block"
               style="background-color: #7f8c8d; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               Unknown Source
            </p>`;
    }
};


//filter by inq status , common fn for both tABLES
const applyInquiryStatusFilter = () => {
    const selectedStatus = document.getElementById('inqStatusFilter').value;
    const roles = JSON.parse(document.getElementById('userRolesArraySection').textContent);
    const isAdminOrManager = roles.includes("System_Admin") || roles.includes("Manager") || roles.includes("Assistant Manager");

    if (isAdminOrManager) {

        let filtered = allInqs;

        if (selectedStatus && selectedStatus !== "All") {
            filtered = filtered.filter(inq => inq.inq_status === selectedStatus);
        }

        renderAllInqTableByFilters(filtered);
    } else {
        let filtered = assignedInqs;

        if (selectedStatus && selectedStatus !== "All") {
            filtered = assignedInqs.filter(inq => inq.inq_status === selectedStatus);
        }

        renderPersonalInquiryTableByFilters(filtered);
    }
};

// fn to render he personal tbl with filtered data
const renderPersonalInquiryTableByFilters = (filteredInquiries) => {
    const tableColumnInfo = [
        { displayType: 'text', displayingPropertyOrFn: 'inqcode', colHeadName: 'Code' },
        { displayType: 'function', displayingPropertyOrFn: showInquirySource, colHeadName: 'Source' },
        { displayType: 'function', displayingPropertyOrFn: showRecievedTimeStamp, colHeadName: 'Recieved Time' },
        { displayType: 'function', displayingPropertyOrFn: showInquiryStatus, colHeadName: 'Status' }
    ];

    $(sharedTableIdPersonalTbl).empty();

    if ($.fn.DataTable.isDataTable(sharedTableIdPersonalTbl)) {
        $(sharedTableIdPersonalTbl).DataTable().clear().destroy();
    }

    createTable(tableHolderDiv, sharedTableIdPersonalTbl, filteredInquiries, tableColumnInfo);

    setTimeout(() => {
        $(`#${sharedTableIdPersonalTbl}`).DataTable({
            destroy: true,
            searching: false,
            info: false,
            pageLength: 10,
            ordering: false,
            lengthChange: false
        });
    }, 100);
};

//for ALL inquiries
const renderAllInqTableByFilters = (filteredInquiries) => {
    const tableColumnInfo = [
        { displayType: 'text', displayingPropertyOrFn: 'inqcode', colHeadName: 'Code' },
        { displayType: 'function', displayingPropertyOrFn: showInquirySource, colHeadName: 'Source' },
        { displayType: 'function', displayingPropertyOrFn: showRecievedTimeStamp, colHeadName: 'Recieved Time' },
        { displayType: 'function', displayingPropertyOrFn: showInquiryStatus, colHeadName: 'Status' },
        { displayType: 'function', displayingPropertyOrFn: showAssignedEmployee, colHeadName: 'Assigned to' }
    ];

    $(sharedTableIdMainTbl).empty();

    if ($.fn.DataTable.isDataTable(sharedTableIdMainTbl)) {
        $(sharedTableIdMainTbl).DataTable().clear().destroy();
    }

    createTable(tableHolderDiv, sharedTableIdMainTbl, filteredInquiries, tableColumnInfo);

    setTimeout(() => {
        $(`#${sharedTableIdMainTbl}`).DataTable({
            destroy: true,
            searching: false,
            info: false,
            pageLength: 10,
            ordering: false,
            lengthChange: false
        });
    }, 100);
};

//show time stamp on table
const showRecievedTimeStamp = (ob) => {
    return ob.recieveddate + "</br>" + (ob.recievedtime ? ob.recievedtime : "12:00")
}

//show assigned EMP details in table  (call each row, NOT USED , SLOW 💥💥💥)
const showAssignedEmployeeOri = async (ob) => {

    if (ob.assigned_empid != null && ob.assigned_empid != "") {
        try {
            empInfo = await ajaxGetReq("empinfo/byempid?empId=" + ob.assigned_empid.id);
            console.log(empInfo);
        } catch (error) {
            console.error("Failed to fetch empinfo:", error);
        }

        return ` <div class= "">
                   ${empInfo.fullname} <br> (${empInfo.emp_code})
                </div>
                    `;
    } else if (ob.assigned_empid == null || ob.assigned_empid == "") {
        return "--"
    }

}

//show assigned EMP details in table ✅
const showAssignedEmployee = (ob) => {
    if (ob.assigned_empid && ob.assigned_empid.id && allEmployeesMap[ob.assigned_empid.id]) {
        const empInfo = allEmployeesMap[ob.assigned_empid.id];
        return `<div>
                   ${empInfo.fullname} <br> (${empInfo.emp_code})
                </div>`;
    } else {
        return "--";
    }
};

//enable assigned user change, this is used in the inquiry form to enable the assigned user select field
const enableAssignedUserChange = () => {

    const assignedUserSelect = document.getElementById('assignedUserSelect');
    assignedUserSelect.disabled = false;

    //enable update button
    const updateBtn = document.getElementById('manualInqUpdateBtn');
    updateBtn.disabled = false;
    updateBtn.style.cursor = "pointer";

}

//global variables , used in openModal 
let intrstdPkgList = [];
let roles = [];

//refresh the inquiry form and reset all fields 
const refreshInquiryForm = async () => {

    setMaxTimeToNow();

    inquiry = new Object();

    try {
        intrstdPkgList = await ajaxGetReq('/tourpackageforweb/all');
        fillMultDataIntoDynamicSelects(inqInterestedPkg, 'Please Select Package', intrstdPkgList, 'pkgcode', 'pkgtitle');
    } catch (error) {
        console.error('Error fetching interested packages:', error);
    }

    try {
        nationalityList = await ajaxGetReq('/nationalityforweb/all');
        fillDataIntoDynamicSelects(InqClientNationality, 'Select Nationality', nationalityList, 'countryname');
        fillDataIntoDynamicDataList(dataListNationality, nationalityList, 'countryname');
    } catch (error) {
        console.error("Error fetching nationality list:", error);

    }

    try {
        emps = await ajaxGetReq('/emp/active/inqoperators');
        fillMultDataIntoDynamicSelects(assignedUserSelect, 'Select Employee', emps, 'emp_code', 'fullname');
    } catch (error) {
        console.error("Error fetching employees:", error);
    }

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inqCodeInput',
        'inqRecievedMethod',
        'inqRecievedDate',
        'inqRecievedTime',
        'inqRecievedContact',
        'inqInterestedPkg',
        'inqClientTitle',
        'inqClientName',
        'InqClientNationality',
        'inqContactOne',
        'inqClientEmail',
        'inqMainEnquiry',
        'prefContMethodPkgRelForm',
        'inqApproxStartDate',
        'inqLocalAdultCount',
        'inqLocalChildCount',
        'inqForeignAdultCount',
        'inqForeignChildCount',
        'inqAccommodationNote',
        'inqPlacesPreferences',
        'inqTransportNote',
        'estdPickupLocation',
        'estdDropOffLocation',
        'inputNoteInquiry',
        'inqStatus',
        'assignedUserSelect'
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.disabled = false;
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

    //disable these permanantly
    document.getElementById('inqCodeInput').disabled = true;
    document.getElementById('inqEnableEditBtn').disabled = true;
    document.getElementById('inqRecievedContact').disabled = true;
    document.getElementById('inqLocalChildCount').disabled = true;
    document.getElementById('inqForeignChildCount').disabled = true;
    document.getElementById('btnChangeAssignedUser').disabled = true;
    document.getElementById('assignedUserSelect').disabled = true;

    //hide WebSite opt
    document.getElementById('inqRecievedMethod').children[1].classList.add('d-none');

    //hide this row
    document.getElementById('assignedUserRow').classList.add('d-none');

    //clear previous responses
    const container = document.getElementById("previousSubmittedAllResponses");
    container.innerHTML = "";

    //get roles 
    const rolesRaw = document.getElementById('userRolesArraySection').textContent;
    console.log("Raw roles text:", rolesRaw);

    roles = JSON.parse(rolesRaw);
    console.log("Parsed roles:", roles);

    if (roles.includes("System_Admin") || roles.includes("Manager") || roles.includes("Assistant Manager")) {
        btnChangeAssignedUser.disabled = false;
    } else {
        btnChangeAssignedUser.disabled = true;
    }

    const existingClientNotice = document.getElementById('existingClientNotice');
    const existingClientRegId = document.getElementById('existingClientRegId');

    existingClientNotice.classList.add('d-none');
    existingClientRegId.classList.add('d-none');

    //disable add new responses button
    const addNewResponseRowBtn = document.getElementById('createNewResponseRowBtn');
    addNewResponseRowBtn.disabled = true;
    addNewResponseRowBtn.style.cursor = "not-allowed";

    inqResetFormBtn.classList.remove("d-none");
    inqPrintBtn.classList.add("d-none");

    //disable update button
    const updateBtn = document.getElementById('manualInqUpdateBtn');
    updateBtn.disabled = true;
    updateBtn.style.cursor = "not-allowed";

    //enable add button
    const addBtn = document.getElementById('manualInqAddBtn');
    addBtn.disabled = false;
    addBtn.style.cursor = "pointer";

}

//for print btn
const printInquirySummary = async (inqObj) => {

    if (!inqObj) {
        alert('No Inquiry data available to print.');
        return;
    }

    const clientFullName = `${inqObj.clienttitle || ''} ${inqObj.clientname || ''}`.trim();
    const contactNum = inqObj.contactnum || 'N/A';
    const email = inqObj.email || 'N/A';
    const nationality = inqObj.nationality_id?.countryname || 'N/A';
    const nicOrPassport = inqObj.passportnumornic || 'N/A';

    const receivedDate = new Date(inqObj.recieveddate || '').toLocaleDateString();
    const receivedTime = (inqObj.recievedtime || '')
    const startDate = inqObj.inq_apprx_start_date
        ? new Date(inqObj.inq_apprx_start_date).toLocaleDateString()
        : 'N/A';
    const startConfirmed = inqObj.is_startdate_confirmed ? 'Yes' : 'No';


    // Fetch followups
    let followupsSection = '';
    try {
        const prevResponses = await ajaxGetReq("/followup/byinqid/" + parseInt(inqObj.id));
        console.log(prevResponses);

        const followupsSize = prevResponses.length;

        if (prevResponses && prevResponses.length > 0) {
            followupsSection = `
                <hr>
                <h5 class="text-primary mb-3">Follow-ups History</h5>
                <div class="followups-section">
            `;

            prevResponses.forEach((followup, index) => {
                const followupDate = new Date(followup.addeddatetime).toLocaleDateString();
                const followupTime = new Date(followup.addeddatetime).toLocaleTimeString();


                //const statusDisplay = followup.followup_status
                //    ? followup.followup_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                //    : 'N/A';

                //                        <div class="mb-2"><strong>Status:</strong> ${statusDisplay}</div>
                followupsSection += `
                    <div class="followup-item mb-3 p-2 border border-secondary rounded">
                        <div class="row mb-2">
                            <div class="col-md-6"><strong>Follow-up #${followupsSize - index}</strong></div>
                            <div class="col-md-6"><strong>Date:</strong> ${followupDate} ${followupTime}</div>
                        </div>

                        <div class="mb-2"><strong>Content:</strong> ${followup.content || 'N/A'}</div>
                    </div>
                `;
            });

            followupsSection += `</div>`;
        } else {
            followupsSection = `
                <hr>
                <h5 class="text-primary mb-3">Follow-ups History</h5>
                <p class="text-muted">No follow-ups recorded for this inquiry.</p>
            `;
        }
    } catch (error) {
        console.error('Error fetching followups:', error);
        followupsSection = `
            <hr>
            <h5 class="text-primary mb-3">Follow-ups History</h5>
            <p class="text-danger">Error loading follow-ups data.</p>
        `;
    }

    const printableContent = `
    <div class="container-fluid my-3 p-1 border border-primary rounded shadow-sm" style="font-family: Arial, sans-serif;">
        <h2 class="text-center text-primary mb-3">Inquiry Summary</h2>
        <hr class="border border-primary border-2">

        <div class="row mb-2">
            <div class="col-md-6"><strong>Inquiry Code:</strong> ${inqObj.inqcode || 'N/A'}</div>
            <div class="col-md-6"><strong>Received:</strong> ${receivedDate} ${receivedTime}</div>
        </div>

        <div class="row mb-2">
            <div class="col-md-6"><strong>Client:</strong> ${clientFullName || 'N/A'}</div>
            <div class="col-md-6"><strong>Contact No:</strong> ${contactNum}</div>
        </div>

        <div class="row mb-2">
            <div class="col-md-6"><strong>Email:</strong> ${email}</div>
            <div class="col-md-6"><strong>Nationality:</strong> ${nationality}</div>
        </div>

        <div class="mb-2"><strong>NIC / Passport No:</strong> ${nicOrPassport}</div>

        <hr>

        <div class="row mb-2">
            <div class="col-md-6"><strong>Approx. Start Date:</strong> ${startDate}</div>
            <div class="col-md-6"><strong>Start Date Confirmed:</strong> ${startConfirmed}</div>
        </div>

        <div class="row mb-2">
            <div class="col-md-6"><strong>Local Adults:</strong> ${inqObj.inq_local_adults || 0}</div>
            <div class="col-md-6"><strong>Local Children:</strong> ${inqObj.inq_local_kids || 0}</div>
        </div>

        <div class="row mb-2">
            <div class="col-md-6"><strong>Foreign Adults:</strong> ${inqObj.inq_foreign_adults || 0}</div>
            <div class="col-md-6"><strong>Foreign Children:</strong> ${inqObj.inq_foreign_kids || 0}</div>
        </div>

        <hr>
        <div class="mb-2"><strong>Client Message:</strong> ${inqObj.main_inq_msg || 'N/A'}</div>
        <hr>
        <div class="mb-2"><strong>Pick-up Details:</strong> ${inqObj.inq_pick || 'N/A'}</div>
        <div class="mb-2"><strong>Drop-off Details:</strong> ${inqObj.inq_drop || 'N/A'}</div>
        <div class="mb-2"><strong>Vehicle Requirements:</strong> ${inqObj.inq_vehi || 'N/A'}</div>
        <div class="mb-2"><strong>Guide Requirements:</strong> ${inqObj.inq_guideneed || 'N/A'}</div>
        <div class="mb-2"><strong>Accommodation Preferences:</strong> ${inqObj.inq_accos || 'N/A'}</div>

        <div class="mb-2"><strong>Places to Visit:</strong> ${inqObj.inq_vplaces || 'N/A'}</div>

         <div class="mb-2"><strong>Internal Notes:</strong> ${inqObj.note || 'N/A'}</div>

         ${followupsSection}

        <p class="text-center text-muted small mt-4">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
    </div>`;

    const printableTitle = `Inquiry_${(inqObj.inqcode || 'Summary').replace(/\s+/g, '_')}`;

    const printWindow = window.open('', '', 'width=1000,height=700');
    printWindow.document.write(`
        <html>
        <head>
            <title>${printableTitle}</title>
            <link rel="stylesheet" href="../libs/bootstrap-5.2.3/css/bootstrap.min.css">
            <style>
                body {
                    margin: 0;
                    padding: 10px;
                    background-color: #f8f9fa;
                    font-family: Arial, sans-serif;
                }
                @media print {
                    body {
                        background-color: white;
                        margin: 0; padding: 0;
                    }
                }
            </style>
        </head>
        <body>${printableContent}</body>
        </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
    };
};

//set status auto
const setInqStatusAuto = () => {

    const inqSelectElement = document.getElementById('inqStatus');

    inqSelectElement.value = 'New';
    inqSelectElement.style.border = '2px solid lime';
    inqSelectElement.children[2].setAttribute('class', 'd-none');
    inqSelectElement.children[3].setAttribute('class', 'd-none');
    inqSelectElement.children[4].setAttribute('class', 'd-none');
    inqSelectElement.children[5].setAttribute('class', 'd-none');
    inqSelectElement.children[6].setAttribute('class', 'd-none');
    inquiry.inq_status = 'New';
}

//delete followup section
const deleteInqFollowupSection = () => {

    let userConfirm = confirm("Are you sure to delete this? this data wont be saved");
    if (userConfirm) {

        refreshInqFollowupSection();

    } else {
        showAlertModal('inf', "Followup response deletion cancelled");
    }

}

//for natonality field
const changeLableNicPpt = () => {
    const labelOfField = document.getElementById('lblForNICorPpt');
    if (InqClientNationality.value === "Sri Lanka") {
        labelOfField.innerText = "NIC: "
    } else {
        labelOfField.innerText = "Passport Number: "
    }
}

//handle guide need or not
const handleNeedGuideCB = () => {
    const guideNeed = document.getElementById('guideYes');
    const guideDontNeed = document.getElementById('guideNo');

    if (guideNeed.checked) {
        inquiry.inq_guideneed = true;
    } else if (guideDontNeed.checked) {
        inquiry.inq_guideneed = false;
    }
}

//check errors
const checkManualInqErrors = () => {
    let errors = "";

    if (inquiry.inqsrc == null) {
        errors = errors + " Please Select The Source Of Inquiry \n";
    }

    if (inquiry.recievedmethod == "Phone Call" && inquiry.recievedcontactoremail == null) {
        errors = errors + " Please Enter The Source Phone Number \n";
    }

    if (inquiry.recievedmethod == "Email" && inquiry.recievedcontactoremail == null) {
        errors = errors + " Please Enter The Source Email Address \n";
    }

    if (inquiry.recieveddate == null) {
        errors = errors + " Please Enter The Inquiry Recieved Date  \n";
    }

    if (inquiry.main_inq_msg == null) {
        errors = errors + " Please Enter The Main Enquiry Details  \n";
    }

    if (inquiry.clientname == null) {
        errors = errors + " Please Enter The Client's Name  \n";
    }

    if (inquiry.nationality_id == null) {
        errors = errors + " Please Select The Client's Nationality  \n";
    }

    if (inquiry.contactnum == null && inquiry.email == null) {
        errors = errors + " Please Enter At Least One Contact Method (Phone or Email)  \n";
    }

    if (inquiry.prefcontactmethod == null) {
        errors = errors + " Please Select The Client's Preferred Contact Method  \n";
    }

    if (inquiry.is_startdate_confirmed == true && inquiry.inq_apprx_start_date == null) {
        errors = errors + " Please Choose The Start Date  \n";
    }

    //for success inq (must check traveller count, start date)
    if (inquiry.inq_status == "Confirmed") {
        if (inquiry.inq_apprx_start_date == null || inquiry.is_startdate_confirmed !== true) {
            errors += " Please Set the Start Date and Confirm It  \n";
        }

        const localAdults = parseInt(inquiry.inq_local_adults) || 0;
        const foreignAdults = parseInt(inquiry.inq_foreign_adults) || 0;

        if (localAdults === 0 && foreignAdults === 0) {
            errors += " Please Enter At Least One Adult Traveller Count (Local or Foreign)  \n";
        }

        if (inquiry.inq_guideneed == null) {
            errors += " Please Select Whether A Guide Is Needed  \n";
        }

    }

    if (inquiry.inq_status === "Working" || inquiry.inq_status === "Confirmed") {
        if (inquiry.assigned_empid == null) {
            errors += " Please Assign An Employee To Handle This Inquiry  \n";
        }
    }

    return errors;
}

//fn to submit button (add button)
const addNewInquiry = async () => {

    const errors = checkManualInqErrors();
    if (errors == '') {
        const userConfirm = confirm('Are you sure to add?');

        if (userConfirm) {
            try {

                //bind the package's id
                const inqInterestedPkgInput = document.getElementById('inqInterestedPkg');

                if (inqInterestedPkgInput.value != null && inqInterestedPkgInput.value != "") {
                    let selectedValue = JSON.parse(inqInterestedPkgInput.value);
                    inquiry.intrstdpkgid = selectedValue.id;
                }

                const postServerResponse = await ajaxPPDRequest("/inq", "POST", inquiry);

                if (postServerResponse === 'OK') {
                    showAlertModal('suc', 'Saved Successfully');
                    document.getElementById('formSystemInq').reset();
                    refreshInquiryForm();
                    handleTableCreation();
                    var myTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    myTableTab.show();
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

//fn to handle the inquiry received method change, enable or disable contact field
const handleRecievedAddr = (methodElement) => {

    const recievedAddr = document.getElementById('inqRecievedContact');

    if (methodElement.value == "Phone Call" || methodElement.value == "Email") {
        recievedAddr.disabled = false;
    } else {
        recievedAddr.disabled = true;
        inquiry.recievedcontactoremail = null;
        recievedAddr.value = '';
        recievedAddr.style.border = "1px solid #ced4da";
    }
}

//const email = encodeURIComponent(inqObj.email || '');
// const custsByEmail = await ajaxGetReq(`/client/byemail?email=${email}`);

//fn to view button, REFILL the data in form 💥💥💥💥💥💥
const openModal = async (inqObj) => {

    inquiry = JSON.parse(JSON.stringify(inqObj));
    oldInquiry = JSON.parse(JSON.stringify(inqObj));

    //call cx filter by email
    let custsByEmail = null;

    try {
        custsByEmail = await ajaxGetReq("/client/byemail?email=" + inqObj.email);
        console.log("Clients fetched by email:", custsByEmail);
    } catch (error) {
        console.error("Error fetching clients by email:", error);
    }

    const existingClientNotice = document.getElementById('existingClientNotice');
    const existingClientRegId = document.getElementById('existingClientRegId');

    if (custsByEmail && custsByEmail.length > 0) {
        existingClientNotice.classList.remove('d-none');
        existingClientRegId.classList.remove('d-none');
        existingClientRegId.textContent = `Customer ID: ${custsByEmail[0].clientcode}`;

    } else {
        existingClientNotice.classList.add('d-none');
        existingClientRegId.classList.add('d-none');
    }

    document.getElementById('inqCodeInput').value = inqObj.inqcode;
    document.getElementById('inqRecievedMethod').value = inqObj.inqsrc;
    document.getElementById('inqRecievedDate').value = inqObj.recieveddate;
    document.getElementById('inqRecievedTime').value = inqObj.recievedtime;
    document.getElementById('inqRecievedContact').value = inqObj.recievedcontactoremail;
    fillMultDataIntoDynamicSelectsRefillById(inqInterestedPkg, 'Please Select Package', intrstdPkgList, 'pkgcode', 'pkgtitle', inqObj.intrstdpkgid);
    document.getElementById('inqClientTitle').value = inqObj.clienttitle;
    document.getElementById('inqClientName').value = inqObj.clientname;
    document.getElementById('InqClientNationality').value = inqObj.nationality_id?.countryname;
    document.getElementById('inqContactOne').value = inqObj.contactnum;
    //document.getElementById('inqAdditionalContact').value = inqObj.contactnumtwo || "N/A";
    document.getElementById('inqClientEmail').value = inqObj.email;
    document.getElementById('prefContMethodPkgRelForm').value = inqObj.prefcontactmethod;
    document.getElementById('inqClientPassportNumorNIC').value = inqObj.passportnumornic;
    document.getElementById('inqMainEnquiry').value = inqObj.main_inq_msg;
    document.getElementById('inqApproxStartDate').value = inqObj.inq_apprx_start_date;

    const startDateConfirmedEl = document.getElementById('startDateConfirmed');
    const startDateUnconfirmedEl = document.getElementById('startDateUnconfirmed');

    if (inqObj.inq_apprx_start_date) {
        startDateConfirmedEl.disabled = false;
        startDateUnconfirmedEl.disabled = false;
    } else {
        startDateConfirmedEl.disabled = true;
        startDateUnconfirmedEl.disabled = true;
    }

    if (inqObj.is_startdate_confirmed === true) {
        startDateConfirmedEl.checked = true;
    } else {
        startDateUnconfirmedEl.checked = true;
    }

    /*  //this happens only once, when opening fresh inqs
      if (inqObj.inq_adults != null && inqObj.inq_adults != 0) {
          if (inquiry.nationality_id.countryname == "Sri Lanka") {
  
              document.getElementById('inqLocalAdultCount').value = inqObj.inq_adults;
              inquiry.inq_local_adults = inqObj.inq_adults;
              oldInquiry.inq_local_adults = inqObj.inq_adults;
              inquiry.inq_adults = null;
  
              document.getElementById('inqLocalChildCount').value = inqObj.inq_kids;
              inquiry.inq_local_kids = inqObj.inq_kids;
              oldInquiry.inq_local_kids = inqObj.inq_kids;
              inquiry.inq_kids = null;
  
          } else {
  
              document.getElementById('inqForeignAdultCount').value = inqObj.inq_adults;
              inquiry.inq_foreign_adults = inqObj.inq_adults;
              oldInquiry.inq_foreign_adults = inqObj.inq_adults;
              inquiry.inq_adults = null;
  
              document.getElementById('inqForeignChildCount').value = inqObj.inq_kids;
              inquiry.inq_foreign_kids = inqObj.inq_kids;
              oldInquiry.inq_foreign_kids = inqObj.inq_kids;
              inquiry.inq_kids = null;
  
          }
          //if (inqObj.inq_adults == 0)
      } else {
          //|| 0 for all
          document.getElementById('inqLocalAdultCount').value = inqObj.inq_local_adults;
          document.getElementById('inqLocalChildCount').value = inqObj.inq_local_kids;
          document.getElementById('inqForeignAdultCount').value = inqObj.inq_foreign_adults;
          document.getElementById('inqForeignChildCount').value = inqObj.inq_foreign_kids;
      }
      */

    const localAdultInput = document.getElementById('inqLocalAdultCount');
    const localChildInput = document.getElementById('inqLocalChildCount');
    const foreignAdultInput = document.getElementById('inqForeignAdultCount');
    const foreignChildInput = document.getElementById('inqForeignChildCount');

    // this happens only once, when opening fresh inqs
    if (inqObj.inq_adults != null && inqObj.inq_adults != 0) {
        if (inquiry.nationality_id.countryname == "Sri Lanka") {

            localAdultInput.value = inqObj.inq_adults;
            inquiry.inq_local_adults = inqObj.inq_adults;
            oldInquiry.inq_local_adults = inqObj.inq_adults;
            inquiry.inq_adults = null;

            localChildInput.value = inqObj.inq_kids;
            inquiry.inq_local_kids = inqObj.inq_kids;
            oldInquiry.inq_local_kids = inqObj.inq_kids;
            inquiry.inq_kids = null;

        } else {

            foreignAdultInput.value = inqObj.inq_adults;
            inquiry.inq_foreign_adults = inqObj.inq_adults;
            oldInquiry.inq_foreign_adults = inqObj.inq_adults;
            inquiry.inq_adults = null;

            foreignChildInput.value = inqObj.inq_kids;
            inquiry.inq_foreign_kids = inqObj.inq_kids;
            oldInquiry.inq_foreign_kids = inqObj.inq_kids;
            inquiry.inq_kids = null;

        }
    } else {
        // || 0 for all
        localAdultInput.value = inqObj.inq_local_adults;
        localChildInput.value = inqObj.inq_local_kids;
        foreignAdultInput.value = inqObj.inq_foreign_adults;
        foreignChildInput.value = inqObj.inq_foreign_kids;
    }


    if (inqObj.inq_guideneed === true) {
        document.getElementById('guideYes').checked = true;
    } else if (inqObj.inq_guideneed === false) {
        document.getElementById('guideNo').checked = true;
    }

    document.getElementById('inqPlacesPreferences').value = inqObj.inq_vplaces;
    document.getElementById('inqAccommodationNote').value = inqObj.inq_accos;
    document.getElementById('inqTransportNote').value = inqObj.inq_vehi;
    document.getElementById('estdPickupLocation').value = inqObj.inq_pick;
    document.getElementById('estdDropOffLocation').value = inqObj.inq_drop;
    document.getElementById('inputNoteInquiry').value = inqObj.note;
    document.getElementById('inqStatus').value = inqObj.inq_status;

    const inputTagsIds = [
        'inqCodeInput',
        'inqRecievedMethod',
        'inqRecievedDate',
        'inqRecievedTime',
        'inqRecievedContact',
        'inqInterestedPkg',
        'inqClientTitle',
        'inqClientName',
        'InqClientNationality',
        'inqContactOne',
        'inqClientEmail',
        'inqClientPassportNumorNIC',
        'inqMainEnquiry',
        'prefContMethodPkgRelForm',
        'inqApproxStartDate',
        'inqLocalAdultCount',
        'inqLocalChildCount',
        'inqForeignAdultCount',
        'inqForeignChildCount',
        'inqAccommodationNote',
        'inqPlacesPreferences',
        'inqTransportNote',
        'estdPickupLocation',
        'estdDropOffLocation',
        'inputNoteInquiry',
        'inqStatus',
        'assignedUserSelect'
    ];

    // disable all inputs in the list
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.disabled = true;
        }
    });

    //radio tags to reset
    const radioIdsToReset = [
        'startDateConfirmed',
        'startDateUnconfirmed',
        'guideYes',
        'guideNo'
    ];

    //clear out any previous styles
    radioIdsToReset.forEach(id => {
        const radio = document.getElementById(id);
        if (radio) {
            radio.disabled = true;
        }
    });

    inqResetFormBtn.classList.add("d-none");
    inqPrintBtn.classList.remove("d-none");

    //'enable edit' button 
    const enableEditBtn = document.getElementById('inqEnableEditBtn');

    //'add new response' button
    const addNewResponseRowBtn = document.getElementById('createNewResponseRowBtn');

    //if inq is completed, cant edit anymore
    if (inqObj.inq_status == "Confirmed" || inqObj.inq_status == "Closed" || inqObj.deleted_inq == true) {

        enableEditBtn.disabled = true;
        enableEditBtn.style.cursor = "not-allowed";

        addNewResponseRowBtn.disabled = true;
        addNewResponseRowBtn.style.cursor = "not-allowed";

        btnChangeAssignedUser.disabled = true;
        btnChangeAssignedUser.style.cursor = "not-allowed";

        //manualInqUpdateBtn.disabled = true;
        //manualInqUpdateBtn.style.cursor = "not-allowed";

    } else {

        enableEditBtn.disabled = false;
        enableEditBtn.style.cursor = "pointer";

        addNewResponseRowBtn.disabled = false;
        addNewResponseRowBtn.style.cursor = "pointer";

        btnChangeAssignedUser.disabled = false;
        btnChangeAssignedUser.style.cursor = "pointer";

        console.log("roles: ", roles);
        if (roles.includes("System_Admin") || roles.includes("Manager") || roles.includes("Assistant Manager")) {
            btnChangeAssignedUser.disabled = false;
        } else {
            btnChangeAssignedUser.disabled = true;
        }

        //manualInqUpdateBtn.disabled = false;
        //manualInqUpdateBtn.style.cursor = "pointer";
    }

    //disable add new button
    const addBtn = document.getElementById('manualInqAddBtn');
    addBtn.disabled = true;
    addBtn.style.cursor = "not-allowed";

    document.getElementById('assignedUserRow').classList.remove('d-none');
    fillMultDataIntoDynamicSelects(assignedUserSelect, 'Select Employee', emps, 'emp_code', 'fullname', inqObj.assigned_empid.fullname);

    refillAllPrevResponses();

    let myInqFormTab = new bootstrap.Tab(document.getElementById('form-tab'));
    myInqFormTab.show();

    let firstTab = new bootstrap.Tab(document.getElementById('inqStep1-tab'));
    firstTab.show();

}

// to enable inquiry editing , enable input fields
const enableInqEditing = () => {

    document.getElementById('inqEnableEditBtn').disabled = true;

    //   "inqForeignChildCount",
    // "inqLocalChildCount",
    const inputIds = [
        "prefContMethodPkgRelForm",
        "inqApproxStartDate",
        "inqLocalAdultCount",
        "inqForeignAdultCount",
        "inqAccommodationNote",
        "inqPlacesPreferences",
        "inqTransportNote",
        "estdPickupLocation",
        "estdDropOffLocation",
        "guideYes",
        "guideNo",
        "inputNoteInquiry",
        "inqStatus"
    ];

    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = false;
        }
    });

    //radio tags to reset
    const radioIdsToReset = [
        'startDateConfirmed',
        'startDateUnconfirmed',
        'guideYes',
        'guideNo'
    ];

    //clear out any previous styles
    radioIdsToReset.forEach(id => {
        const radio = document.getElementById(id);
        if (radio) {
            radio.disabled = false;
        }
    });

    //hide new and assigned options
    const statusSelectElem = document.getElementById('inqStatus');
    for (let i = 1; i <= 2; i++) {
        if (statusSelectElem.options[i]) {
            statusSelectElem.options[i].style.display = 'none';
        }
    }

    //as soon as this btn clicked, the sttas will be Working
    if (statusSelectElem.value == "Assigned") {
        statusSelectElem.options[2].style.display = 'none';
        statusSelectElem.value = "Working";
        statusSelectElem.style.border = "2px solid lime"
    }


    const updateBtn = document.getElementById('manualInqUpdateBtn');
    updateBtn.disabled = false;
    updateBtn.style.cursor = "pointer";

}

//get updates
const showInqValueChanges = () => {

    let updates = "";

    if (inquiry.main_inq_msg != oldInquiry.main_inq_msg) {
        updates = updates + "Main Enquiry Message changed from " + oldInquiry.main_inq_msg.trim() + " to " + inquiry.main_inq_msg.trim() + "\n";
    }

    if (inquiry.prefcontactmethod !== oldInquiry.prefcontactmethod) {
        updates += `Preferred Contact Method changed from ${oldInquiry.prefcontactmethod || 'N/A'} to ${inquiry.prefcontactmethod || 'N/A'}\n`;
    }

    if (inquiry.inq_apprx_start_date != oldInquiry.inq_apprx_start_date) {
        updates = updates + "Estimated Start Date changed from " + oldInquiry.inq_apprx_start_date + " to " + inquiry.inq_apprx_start_date + "\n";
    }

    //if (inquiry.is_startdate_confirmed !== oldInquiry.is_startdate_confirmed) {
    //    updates += `Start Date Confirmation changed from ${oldInquiry.is_startdate_confirmed ? "Confirmed" : "Not Confirmed"} to ${inquiry.is_startdate_confirmed ? "Confirmed" : "Not Confirmed"}\n`;
    //}

    if (
        inquiry.is_startdate_confirmed !== oldInquiry.is_startdate_confirmed &&
        inquiry.is_startdate_confirmed !== null &&
        oldInquiry.is_startdate_confirmed !== null
    ) {
        updates += `Start Date Confirmation changed from ${oldInquiry.is_startdate_confirmed} to ${inquiry.is_startdate_confirmed}\n`;
    }


    if (inquiry.inq_guideneed !== oldInquiry.inq_guideneed) {
        updates += `Guide Requirement changed from ${oldInquiry.inq_guideneed ? "Yes" : "No"} to ${inquiry.inq_guideneed ? "Yes" : "No"}\n`;
    }

    if (inquiry.inq_pick !== oldInquiry.inq_pick) {
        updates += `Pickup Location changed from ${oldInquiry.inq_pick?.trim() || "N/A"} to ${inquiry.inq_pick?.trim() || "N/A"}\n`;
    }

    if (inquiry.inq_drop !== oldInquiry.inq_drop) {
        updates += `Drop-off Location changed from ${oldInquiry.inq_drop?.trim() || "N/A"} to ${inquiry.inq_drop?.trim() || "N/A"}\n`;
    }

    if (inquiry.inq_vplaces !== oldInquiry.inq_vplaces) {
        updates += `Places Preferences changed from ${oldInquiry.inq_vplaces?.trim() || "N/A"} to ${inquiry.inq_vplaces?.trim() || "N/A"}\n`;
    }

    if (inquiry.inq_accos !== oldInquiry.inq_accos) {
        updates += `Accommodation Note changed from ${oldInquiry.inq_accos?.trim() || "N/A"} to ${inquiry.inq_accos?.trim() || "N/A"}\n`;
    }

    if (inquiry.inq_vehi !== oldInquiry.inq_vehi) {
        updates += `Transport Note changed from ${oldInquiry.inq_vehi?.trim() || "N/A"} to ${inquiry.inq_vehi?.trim() || "N/A"}\n`;
    }

    if (inquiry.note !== oldInquiry.note) {
        updates += `Internal Note changed from ${oldInquiry.note?.trim() || "N/A"} to ${inquiry.note?.trim() || "N/A"}\n`;
    }

    //for nationality
    const nationality = inquiry.nationality_id?.countryname;

    if (oldInquiry.inq_adults != null || oldInquiry.inq_kids != null) {

        const oldAdults = oldInquiry.inq_adults || 0;
        const oldKids = oldInquiry.inq_kids || 0;

        //when changing for the first time
        if (nationality === "Sri Lanka") {
            if (inquiry.inq_local_adults !== oldAdults) {
                updates += `Traveller Group: Local Adult Count changed from ${oldAdults} to ${inquiry.inq_local_adults}\n`;
            }
            if (inquiry.inq_local_kids !== oldKids) {
                updates += `Traveller Group: Local Child Count changed from ${oldKids} to ${inquiry.inq_local_kids}\n`;
            }
        } else {
            if (inquiry.inq_foreign_adults !== oldAdults) {
                updates += `Traveller Group: Foreign Adult Count changed from ${oldAdults} to ${inquiry.inq_foreign_adults}\n`;
            }
            if (inquiry.inq_foreign_kids !== oldKids) {
                updates += `Traveller Group: Foreign Child Count changed from ${oldKids} to ${inquiry.inq_foreign_kids}\n`;
            }
        }

        //when chainging for the 2nd time and after, when this happens there is no value in inq_adults or inq_kids
    } else {

        //        if (inquiry.inq_local_adults !== oldInquiry.inq_local_adults && !(inquiry.inq_local_adults == 0 && oldInquiry.inq_local_adults == 0)) {
        //            updates += `Traveller Group: Local Adult Count changed from ${oldInquiry.inq_local_adults || 0} to ${inquiry.inq_local_adults}\n`;
        //        }
        //
        //        if (inquiry.inq_local_kids !== oldInquiry.inq_local_kids && !(inquiry.inq_local_kids == 0 && oldInquiry.inq_local_kids == 0)) {
        //            updates += `Traveller Group: Local Child Count changed from ${oldInquiry.inq_local_kids || 0} to ${inquiry.inq_local_kids}\n`;
        //        }
        //
        //        if (inquiry.inq_foreign_adults !== oldInquiry.inq_foreign_adults && !(inquiry.inq_foreign_adults == 0 && oldInquiry.inq_foreign_adults == 0)) {
        //            updates += `Traveller Group: Foreign Adult Count changed from ${oldInquiry.inq_foreign_adults || 0} to ${inquiry.inq_foreign_adults}\n`;
        //        }
        //
        //        if (inquiry.inq_foreign_kids !== oldInquiry.inq_foreign_kids && !(inquiry.inq_foreign_kids == 0 && oldInquiry.inq_foreign_kids == 0)) {
        //            updates += `Traveller Group: Foreign Child Count changed from ${oldInquiry.inq_foreign_kids || 0} to ${inquiry.inq_foreign_kids}\n`;
        //        }

        if (inquiry.inq_local_adults !== oldInquiry.inq_local_adults && !((inquiry.inq_local_adults || 0) == 0 && (oldInquiry.inq_local_adults || 0) == 0)) {
            updates += `Traveller Group: Local Adult Count changed from ${oldInquiry.inq_local_adults || 0} to ${inquiry.inq_local_adults}\n`;
        }

        if (inquiry.inq_local_kids !== oldInquiry.inq_local_kids && !((inquiry.inq_local_kids || 0) == 0 && (oldInquiry.inq_local_kids || 0) == 0)) {
            updates += `Traveller Group: Local Child Count changed from ${oldInquiry.inq_local_kids || 0} to ${inquiry.inq_local_kids}\n`;
        }

        if (inquiry.inq_foreign_adults !== oldInquiry.inq_foreign_adults && !((inquiry.inq_foreign_adults || 0) == 0 && (oldInquiry.inq_foreign_adults || 0) == 0)) {
            updates += `Traveller Group: Foreign Adult Count changed from ${oldInquiry.inq_foreign_adults || 0} to ${inquiry.inq_foreign_adults}\n`;
        }

        if (inquiry.inq_foreign_kids !== oldInquiry.inq_foreign_kids && !((inquiry.inq_foreign_kids || 0) == 0 && (oldInquiry.inq_foreign_kids || 0) == 0)) {
            updates += `Traveller Group: Foreign Child Count changed from ${oldInquiry.inq_foreign_kids || 0} to ${inquiry.inq_foreign_kids}\n`;
        }

    }

    //assigned_empid
    if (inquiry.assigned_empid.id != oldInquiry.assigned_empid.id) {
        updates += `Assigned Employee changed from ${oldInquiry.assigned_empid.fullname} to ${inquiry.assigned_empid.fullname}\n`;

    }

    //for status
    if (inquiry.inq_status !== oldInquiry.inq_status) {
        updates += `Status changed from ${oldInquiry.inq_status || "N/A"} to ${inquiry.inq_status || "N/A"}\n`;
    }

    return updates;

}

//at least one adult count has to be non zero
const checkAtLeastOneAdultPresent = () => {

    const localAdult = document.getElementById('inqLocalAdultCount');
    const foreignAdult = document.getElementById('inqForeignAdultCount');

    const localVal = parseInt(localAdult.value) || 0;
    const foreignVal = parseInt(foreignAdult.value) || 0;

    if (localVal === 0 && foreignVal === 0) {
        localAdult.style.border = "2px solid red";
        foreignAdult.style.border = "2px solid red";
        inquiry.inq_foreign_adults = null;
        inquiry.inq_local_adults = null;
    }
    else {

        localAdult.style.border = "2px solid lime";
        foreignAdult.style.border = "2px solid lime";
        inquiry.inq_foreign_adults = foreignVal;
        inquiry.inq_local_adults = localVal;

    }

}

//refresh the inquiry followup section and reset all fields
const refreshInqFollowupSection = () => {

    followup = new Object();

    document.getElementById('manualResponseAddingSection').innerHTML = '';

    const addNewResponseRowBtn = document.getElementById('createNewResponseRowBtn');
    addNewResponseRowBtn.disabled = false;
    addNewResponseRowBtn.style.cursor = "pointer";

}

// set the same quoted pkg's id to main inquiry
const setSameForMainInq = (selectElement) => {

    const selectedValue = selectElement.value;

    if (selectedValue !== "Please Select Package") {
        const selectedPkg = JSON.parse(selectedValue);
        inquiry.lastquotedpkgid = selectedPkg.id;
    } else {
        inquiry.lastquotedpkgid = null;
    }

}

// some changes based on inq stts updates
const changesBasedOnInqStts = (statusSelectElement) => {

    const value = statusSelectElement.value;
    const updateBtn = document.getElementById('manualInqUpdateBtn');
    const convToBknBtn = document.getElementById('convertToBookingBtn');
    const pptOrNicField = document.getElementById('inqClientPassportNumorNIC');
    const contactOneInput = document.getElementById('inqContactOne');
    const emailInput = document.getElementById('inqClientEmail');

    if (value === "Confirmed") {

        convToBknBtn.classList.remove('d-none');
        updateBtn.classList.add('d-none');
        pptOrNicField.disabled = false;

        if (contactOneInput.value.trim() === "") {
            contactOneInput.disabled = false;
        }

        if (emailInput.value.trim() === "") {
            emailInput.disabled = false;
        }

    } else if (value === "Closed") {
        updateBtn.textContent = "Close Inquiry";
        updateBtn.classList.remove('d-none');
        convToBknBtn.classList.add('d-none');
        pptOrNicField.disabled = true;

        contactOneInput.disabled = true;
        emailInput.disabled = true;
    } else {
        updateBtn.textContent = "Update Entry";
        updateBtn.classList.remove('d-none');
        convToBknBtn.classList.add('d-none');
        pptOrNicField.disabled = true;

        contactOneInput.disabled = true;
        emailInput.disabled = true;
    }

}

//only runs when inq is marked as confirmed
const checkInqSuccessErrors = () => {

    let errors = "";

    if (inquiry.contactnum == null || inquiry.contactnum.trim().toUpperCase() === "N/A" ||
    inquiry.contactnum.trim() === "" ) {
        errors += "Please enter the client's contact number \n";
    }

    if (inquiry.email == null || inquiry.email.trim().toUpperCase() === "N/A" ||
    inquiry.email.trim() === "" ) {
        errors += "Please enter the client's Email \n";
    }

    if (inquiry.passportnumornic == null || inquiry.passportnumornic.trim() === "" ||
        inquiry.passportnumornic.trim().toUpperCase() === "N/A") {
        errors += "Please enter the client's passport number or NIC \n";
    }

    if (inquiry.lastquotedpkgid == null || inquiry.lastquotedpkgid === "") {
        errors += "Please select a package for this inquiry (in followup section) \n";
    }

    if (inquiry.inq_apprx_start_date == null) {
        errors += "Please choose a confirmed start date \n"
    }

    let foreignAdults = parseInt(inquiry.inq_foreign_adults) || 0;
    let localAdults = parseInt(inquiry.inq_local_adults) || 0;

    if (foreignAdults === 0 && localAdults === 0) {
        errors += "Please add the traveller count \n";
    }

    if (inquiry.inq_guideneed == null) {
        errors += "Please choose whether a guide is needed or not \n";
    }

    if (
        inquiry.inq_pick == null ||
        inquiry.inq_pick.trim() === "" ||
        inquiry.inq_pick.trim().toUpperCase() === "N/A"
    ) {
        errors += "Please enter the initial pickup location \n";
    }

    if (
        inquiry.inq_drop == null ||
        inquiry.inq_drop.trim() === "" ||
        inquiry.inq_drop.trim().toUpperCase() === "N/A"
    ) {
        errors += "Please enter the final drop-off location \n";
    }


    return errors;
}

//mark inquiry as success and create booking and customer records
const convertInqToBooking = async () => {

    let errors = checkInqSuccessErrors();

    if (errors == "") {
        const changesHappened = showInqValueChanges();
        if (changesHappened == "") {
            showAlertModal('war', "No changes detected to update");
        } else {
            //to remove general traveller grp counts, bcz they are now saved in local/foreign separately
            inquiry.inq_adults = null;
            inquiry.inq_kids = null;

            let userConfirm = confirm("Are you sure to preoceed thin inquiry to a booking?\n\n" + changesHappened);

            if (userConfirm) {

                followup.content = "Converted to a booking";

                //update the main inquiry too (important)
                followup.inquiry_id = inquiry;

                try {

                    let putServiceResponse = await ajaxPPDRequest("/createbookingbyinq", "POST", followup);

                    if (putServiceResponse === "OK") {

                        showAlertModal('suc', "Successfully Created Booking");
                        refillAllPrevResponses();
                        handleTableCreation();
                        refreshInquiryForm();
                        var tableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                        tableTab.show();

                    } else {
                        showAlertModal('err', "Booking creation failed \n" + putServiceResponse);
                    }

                } catch (error) {
                    showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
                }
            } else {
                showAlertModal('inf', 'User cancelled the task');
            }
        }
    } else {
        showAlertModal('err', errors);
    }
}

//update a manual inq (also with or without followups that auto made by showValueChanges fn)
const updateSystemInqWithFollowup = async () => {

    let errors = checkManualInqErrors();

    if (errors == "") {
        const changesHappened = showInqValueChanges();
        if (changesHappened == "") {
            showAlertModal('war', "No changes detected to update");

        } else {

            //to remove general traveller grp counts, bcz they are now saved in local/foreign separately
            inquiry.inq_adults = null;
            inquiry.inq_kids = null;

            let userComment = prompt(changesHappened + "\n\n Add a short comment to describe this update: ");

            if (userComment === null || userComment.trim() === "") {
                showAlertModal('inf', "No comment entered. Task cancelled.");
                return;
            }

            let fullContent = `${changesHappened}\n---\nEmployee Comment: ${userComment || 'N/A'}`;

            //to add the followup
            followup.content = fullContent;

            //update the main inquiry too
            followup.inquiry_id = inquiry;

            try {
                let putServiceResponse = await ajaxPPDRequest("/autogeneratedfollowupalsowithmaininquiry", "POST", followup);
                if (putServiceResponse === "OK") {
                    showAlertModal('suc', "Successfully Updated");
                    refillAllPrevResponses();
                    handleTableCreation();
                    var followupTab = new bootstrap.Tab(document.getElementById('inqStep3-tab'));
                    followupTab.show();
                } else {
                    showAlertModal('err', "Update Failed \n" + putServiceResponse);
                }

            } catch (error) {
                showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
            }

        }
    } else {
        showAlertModal('err', errors);
    }

}

//const debouncedGetClientByEmail = debounce(getClientByEmail, 500);

//show all the responses
const refillAllPrevResponses = async () => {

    // /followup/byinqid/{inqId}
    try {
        const prevResponses = await ajaxGetReq("/followup/byinqid/" + parseInt(inquiry.id));
        console.log(prevResponses);

        const container = document.getElementById("previousSubmittedAllResponses");
        container.innerHTML = "";

        if (!prevResponses || prevResponses.length === 0) {
            const noData = document.createElement("p");
            noData.classList.add("text-muted");
            noData.innerText = "No follow-up responses available.";
            container.appendChild(noData);
            return;
        }

        for (const res of prevResponses) {
            let empInfo = null;
            try {
                empInfo = await ajaxGetReq("empinfo/byuserid?userid=" + res.addeduserid);
            } catch (error) {
                console.error("Failed to fetch empinfo for user " + res.addeduserid + ":", error);
            }

            const colDiv = document.createElement("div");
            colDiv.classList.add("col-12", "mb-3");

            // Box container with border/shadow
            const boxDiv = document.createElement("div");
            boxDiv.classList.add("p-3", "rounded", "border", "shadow-sm", "bg-light");

            // Inner row for layout
            const rowDiv = document.createElement("div");
            rowDiv.classList.add("row");

            // ---- col-9: Main Content ----
            const col8 = document.createElement("div");
            col8.classList.add("col-8");

            const contentLabel = document.createElement("div");
            contentLabel.classList.add("text-muted", "fw-bold");
            contentLabel.innerText = "Content:";

            const contentPre = document.createElement("pre");
            contentPre.classList.add("mb-0");
            contentPre.innerText = res.content;

            col8.appendChild(contentLabel);
            col8.appendChild(contentPre);

            // ---- col-3: Meta info ----
            const col4 = document.createElement("div");
            col4.classList.add("col-4", "d-flex", "flex-column", "align-items-end", "text-end");

            // Added by label + user id or employee name if available
            const userSpan = document.createElement("div");
            userSpan.classList.add("text-muted");
            const userLabel = empInfo && empInfo.fullname
                ? `<i class="bi bi-person"></i> Added by: ${empInfo.fullname}`
                : `<i class="bi bi-person"></i> Added by: ${res.addeduserid}`;
            userSpan.innerHTML = userLabel;

            // At label + formatted time
            const timeSpan = document.createElement("div");
            timeSpan.classList.add("text-muted");
            const dateObj = new Date(res.addeddatetime);
            timeSpan.innerHTML = ` <i class="bi bi-clock-history"></i> At: ${dateObj.toLocaleString()}`;

            col4.appendChild(userSpan);
            col4.appendChild(timeSpan);

            // Assemble row
            rowDiv.appendChild(col8);
            rowDiv.appendChild(col4);

            if (res.is_package_quoted && res.last_sent_tpkg) {
                const pkgInfoDiv = document.createElement("div");
                pkgInfoDiv.classList.add("mt-2", "pt-2", "border-top", "w-100", "text-muted", "small");

                const pkgTitle = res.last_sent_tpkg.pkgtitle || "Unknown Title";
                const pkgCode = res.last_sent_tpkg.pkgcode || "Unknown Code";

                pkgInfoDiv.innerHTML = `<i class="bi bi-box-seam"></i> Quoted Package: <span class="fw-semibold">${pkgTitle}</span> (${pkgCode})`;

                rowDiv.appendChild(pkgInfoDiv);
            }


            // Wrap in card box
            boxDiv.appendChild(rowDiv);
            colDiv.appendChild(boxDiv);
            container.appendChild(colDiv);
        }


    } catch (error) {
        console.error("Failed to fetch inquiry responses:", error);
    }

}

//re render the template  
const createNewResponseInputSection = async () => {
    document.getElementById("createNewResponseRowBtn").disabled = true;

    const template = document.getElementById("response-input-template");
    const clone = template.content.cloneNode(true);

    document.getElementById("manualResponseAddingSection").appendChild(clone);

    //get custom tour packages made for this inquiry
    try {
        console.log(inquiry.id);
        const tpkgs = await ajaxGetReq("/tpkg/custom/byinq?inqid=" + inquiry.id);
        fillMultDataIntoDynamicSelects(lastSentTourPackageSelect, 'Please Select Package', tpkgs, 'pkgcode', 'pkgtitle');
    } catch (error) {
        console.error("Failed to fetch tour packages:", error);
    }

    packageQuotedNo.checked = true;
    inquiry.is_package_quoted = false;

}

//check manual followup errors
const checkManualFollowupErrors = () => {
    let errors = "";

    if (followup.content == null || followup.content.trim() === "") {
        errors = errors + " Please Enter The Follow-up Response Summary \n";
    }

    if (followup.is_package_quoted && followup.last_sent_tpkg == null) {
        errors = errors + " Please Select The Last Sent Package \n";
    }

    //    if (followup.followup_status == null) {
    //        errors = errors + " Please Select The Follow-up Status \n";
    //    }
    //
    //    if (followup.followup_status == "quote_sent" && followup.last_sent_tpkg == null) {
    //        errors = errors + " Please Select The Tour Package Sent \n";
    //    }
    //
    //    if (followup.followup_status == "good_to_book" && followup.last_sent_tpkg == null) {
    //        errors = errors + " Please Select The Tour Package \n";
    //    }

    return errors;
}

//fn to submit the manual followup only
const submitOnlyManualFollowup = async () => {

    const errors = checkManualFollowupErrors();
    if (errors == '') {

        let userConfirm = confirm("Are you sure to proceed ?");

        if (userConfirm) {

            followup.inquiry_id = inquiry;

            console.log("Follow up object: ", followup);
            try {
                let postServiceResponse = await ajaxPPDRequest("/followuponly", "POST", followup);
                if (postServiceResponse === "OK") {
                    showAlertModal('suc', "Followup Successfully Added");

                    //hide followup form section
                    document.getElementById('manualResponseAddingSection').innerHTML = '';

                    //show previous responses list
                    refillAllPrevResponses();

                    document.getElementById('inqStatus').value = inquiry.inq_status;

                    //enable add new response button
                    const addNewResponseRowBtn = document.getElementById('createNewResponseRowBtn');
                    addNewResponseRowBtn.disabled = false;
                    addNewResponseRowBtn.style.cursor = "pointer";

                } else {
                    showAlertModal('err', "Submit Failed \n" + putServiceResponse);
                }

            } catch (error) {
                showAlertModal('err', 'An error occurred: ' + (error.responseText || error.statusText || error.message));
            }
        } else {
            showAlertModal('inf', "User cancelled the task");
        }
    } else {
        showAlertModal('war', errors);
    }
}

// child inputs are only available if there is adult values
const handleChildInputAvailability = () => {

    const localAdultCount = parseInt(inqLocalAdultCount.value.trim()) || 0;
    const foreignAdultCount = parseInt(inqForeignAdultCount.value.trim()) || 0;

    const hasAnyAdult = localAdultCount > 0 || foreignAdultCount > 0;

    if (hasAnyAdult) {

        inqLocalChildCount.disabled = false;
        inqForeignChildCount.disabled = false;

    } else {

        inqLocalChildCount.disabled = true;
        inqForeignChildCount.disabled = true;

        inqLocalChildCount.value = 0;
        inqForeignChildCount.value = 0;

        inquiry.inq_local_kids = 0;
        inquiry.inq_foreign_kids = 0;

        inqLocalChildCount.style.border = "1px solid #ced4da";
        inqForeignChildCount.style.border = "1px solid #ced4da";
    }
};

//to mark if start date is sure ot not
const handleStartDateStatusChangeOri = () => {

    const startDateSure = document.getElementById('startDateConfirmed');
    const startDateUncertain = document.getElementById('startDateUnconfirmed');
    const startDateInput = document.getElementById('inqApproxStartDate');

    //IF A DATE IS CHOSEN
    if (inquiry.inq_apprx_start_date != null) {

        if (startDateSure.checked) {
            inquiry.is_startdate_confirmed = true;
            startDateInput.style.border = "2px solid lime";

        } else if (startDateUncertain.checked) {
            inquiry.is_startdate_confirmed = false;
            startDateInput.style.border = "2px solid orange";
        }

    } else if (inquiry.inq_apprx_start_date == null) {
        //IF NO VALUE IN DATE FIELD
        inquiry.is_startdate_confirmed = null;
        showAlertModal('err', 'Set a date first')
    }
}

const handleStartDateStatusChange = () => {
    const startDateSure = document.getElementById('startDateConfirmed');
    const startDateUncertain = document.getElementById('startDateUnconfirmed');
    const startDateInput = document.getElementById('inqApproxStartDate');
    const selectedDate = startDateInput.value;

    if (selectedDate) {
        // Date is selected
        if (startDateSure.checked) {
            inquiry.is_startdate_confirmed = true;
            startDateInput.style.border = "2px solid lime";
        } else if (startDateUncertain.checked) {
            inquiry.is_startdate_confirmed = false;
            startDateInput.style.border = "2px solid orange";
        }
    } else {
        // No date selected
        inquiry.is_startdate_confirmed = null;
        showAlertModal('err', 'Set a date first');

        startDateSure.checked = false;
        startDateUncertain.checked = false;
    }
}


//changes based on dates
const enableDateStatusRadios = () => {
    const startDateSure = document.getElementById('startDateConfirmed');
    const startDateUncertain = document.getElementById('startDateUnconfirmed');

    startDateSure.checked = false;
    startDateUncertain.checked = false;

    if (inqApproxStartDate.value != "") {
        startDateSure.disabled = false;
        startDateUncertain.disabled = false;
    } else {
        startDateSure.disabled = true;
        startDateUncertain.disabled = true;
    }
}

// to handle the package selection , its quoted or not
const handlePkgQuotedOrNot = () => {

    const yesRadio = document.getElementById('packageQuotedYes');
    const noRadio = document.getElementById('packageQuotedNo');
    const pkgSelect = document.getElementById('lastSentTourPackageSelect');

    if (yesRadio.checked) {

        followup.is_package_quoted = true;
        pkgSelect.disabled = false;

    } else if (noRadio.checked) {

        followup.is_package_quoted = false;
        pkgSelect.value = "";
        pkgSelect.style.border = "1px solid #ced4da";
        pkgSelect.disabled = true;
        followup.last_sent_tpkg = null;
    }
}

//childs are allowed only with adult of any type NOT USED 💥💥
const enableChildCountInputsOri = () => {

    if (parseInt(inqLocalAdultCount.value) > 0 || parseInt(inqForeignAdultCount.value) > 0) {
        inqLocalChildCount.disabled = false;
        inqForeignChildCount.disabled = false;

    } else {
        inqLocalChildCount.disabled = true;
        inqForeignChildCount.disabled = true;
        inquiry.inq_local_kids = 0;
        inquiry.inq_foreign_kids = 0;

    }
}



//for 2nd contact num field
//const sameContactError = () => {
//    if (inqAdditionalContact.value === inqContactOne.value) {
//        alert("Enter A Different Number than The Previous Contact Number")
//        inqAdditionalContact.style.border = '2px solid red';
//        inquiry.contactnumtwo = null
//    } else {
//        inputFieldValidator(this, '', 'inquiry', 'contactnumtwo');
//        inqAdditionalContact.style.border = '2px solid lime';
//    }
//}






























//    const changes = showInqValueChanges();
//    console.log(changes);
//
//    followup.content = changes;
//    console.log("followup : ",followup );
//
//    console.log("Inq before followup: ", inquiry);
//
//    inquiry.followup.content = changes;
//
//    console.log("Inq after followup: ", inquiry);

//document.getElementById('inputNoteInquiry').value = changes;