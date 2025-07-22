window.addEventListener('load', () => {

    refreshInquiryForm();
    refreshInqFollowupSection();
    handleTableCreation();
    handleDateFields();
    refillFilterExecutives();
});

//clear out the form everytime a user switches to table tab
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('myTab').addEventListener('shown.bs.tab', function (event) {
        if (event.target.id === 'table-tab') {
            console.log("Switching to table tab - clearing form");
            refreshInquiryForm();
            refreshInqFollowupSection();
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    controlSidebarLinks();
});

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
            { displayType: 'text', displayingPropertyOrFn: 'inqsrc', colHeadName: 'Source' },
            { displayType: 'function', displayingPropertyOrFn: showRecievedTimeStamp, colHeadName: 'Recieved Time' },
            { displayType: 'text', displayingPropertyOrFn: 'inq_status', colHeadName: 'Status' },
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
            { displayType: 'text', displayingPropertyOrFn: 'inqsrc', colHeadName: 'Source' },
            { displayType: 'function', displayingPropertyOrFn: showRecievedTimeStamp, colHeadName: 'Recieved Time' },
            { displayType: 'text', displayingPropertyOrFn: 'inq_status', colHeadName: 'Status' }
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
        { displayType: 'text', displayingPropertyOrFn: 'inqsrc', colHeadName: 'Source' },
        { displayType: 'function', displayingPropertyOrFn: showRecievedTimeStamp, colHeadName: 'Recieved Time' },
        { displayType: 'text', displayingPropertyOrFn: 'inq_status', colHeadName: 'Status' }
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
        { displayType: 'text', displayingPropertyOrFn: 'inqsrc', colHeadName: 'Source' },
        { displayType: 'function', displayingPropertyOrFn: showRecievedTimeStamp, colHeadName: 'Recieved Time' },
        { displayType: 'text', displayingPropertyOrFn: 'inq_status', colHeadName: 'Status' },
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

//refresh the inquiry form and reset all fields 
const refreshInquiryForm = async () => {

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
        'inqAdditionalContact',
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

    const roles = JSON.parse(rolesRaw);
    console.log("Parsed roles:", roles);

    if (roles.includes("System_Admin") || roles.includes("Manager")) {
        btnChangeAssignedUser.disabled = false;
    } else {
        btnChangeAssignedUser.disabled = true;
    }

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
        const prevResponses = await ajaxGetReq("/followup/byinqid/" + inqObj.id);
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

                // Format status for display
                const statusDisplay = followup.followup_status
                    ? followup.followup_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    : 'N/A';

                followupsSection += `
                    <div class="followup-item mb-3 p-2 border border-secondary rounded">
                        <div class="row mb-2">
                            <div class="col-md-6"><strong>Follow-up #${followupsSize - index}</strong></div>
                            <div class="col-md-6"><strong>Date:</strong> ${followupDate} ${followupTime}</div>
                        </div>
                        <div class="mb-2"><strong>Status:</strong> ${statusDisplay}</div>
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

//for 2nd contact num field
const sameContactError = () => {
    if (inqAdditionalContact.value === inqContactOne.value) {
        alert("Enter A Different Number than The Previous Contact Number")
        inqAdditionalContact.style.border = '2px solid red';
        inquiry.contactnumtwo = null
    } else {
        inputFieldValidator(this, '', 'inquiry', 'contactnumtwo');
        inqAdditionalContact.style.border = '2px solid lime';
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
        existingClientRegId.textContent = `Customer ID: CUST-${custsByEmail[0].clientcode || 'N/A'}`;

        const passportInputWrapper = document.querySelector('#inqClientPassportNumorNIC').closest('.col-6');
        passportInputWrapper.classList.remove('d-none');
        document.getElementById('inqClientPassportNumorNIC').value = custsByEmail[0].passportornic || '';

        const additionalContactWrapper = document.querySelector('#inqAdditionalContact').closest('.col-3');
        additionalContactWrapper.classList.remove('d-none');
        document.getElementById('inqAdditionalContact').value = custsByEmail[0].contacttwo || '';

    } else {
        existingClientNotice.classList.add('d-none');
        existingClientRegId.classList.add('d-none');

        const passportInputWrapper = document.querySelector('#inqClientPassportNumorNIC').closest('.col-6');
        passportInputWrapper.classList.add('d-none');
        document.getElementById('inqClientPassportNumorNIC').value = '';

        const additionalContactWrapper = document.querySelector('#inqAdditionalContact').closest('.col-3');
        additionalContactWrapper.classList.add('d-none');
        document.getElementById('inqAdditionalContact').value = '';
    }

    document.getElementById('inqCodeInput').value = inqObj.inqcode || "N/A";
    document.getElementById('inqRecievedMethod').value = inqObj.inqsrc || "N/A";
    document.getElementById('inqRecievedDate').value = inqObj.recieveddate || "N/A";
    document.getElementById('inqRecievedTime').value = inqObj.recievedtime || "N/A";
    document.getElementById('inqRecievedContact').value = inqObj.recievedcontactoremail || "N/A";
    fillMultDataIntoDynamicSelectsInq(inqInterestedPkg, 'Please Select Package', intrstdPkgList, 'pkgcode', 'pkgtitle', inqObj.intrstdpkgid);
    document.getElementById('inqClientTitle').value = inqObj.clienttitle || "N/A";
    document.getElementById('inqClientName').value = inqObj.clientname || "N/A";
    document.getElementById('InqClientNationality').value = inqObj.nationality_id?.countryname || "N/A";
    document.getElementById('inqContactOne').value = inqObj.contactnum || "N/A";
    document.getElementById('inqAdditionalContact').value = inqObj.contactnumtwo || "N/A";
    document.getElementById('inqClientEmail').value = inqObj.email || "N/A";
    document.getElementById('prefContMethodPkgRelForm').value = inqObj.prefcontactmethod || "N/A";
    document.getElementById('inqClientPassportNumorNIC').value = inqObj.passportnumornic || "N/A";
    document.getElementById('inqMainEnquiry').value = inqObj.main_inq_msg || "N/A";
    document.getElementById('inqApproxStartDate').value = inqObj.inq_apprx_start_date || "N/A";

    if (inqObj.inq_apprx_start_date != null || inqObj.inq_apprx_start_date != undefined) {
        document.getElementById('startDateConfirmed').disabled = false;
        document.getElementById('startDateUnconfirmed').disabled = false;
    }

    if (inqObj.is_startdate_confirmed == true) {
        document.getElementById('startDateConfirmed').checked = true;
    } else if (inqObj.is_startdate_confirmed == false || inqObj.is_startdate_confirmed == null) {
        document.getElementById('startDateUnconfirmed').checked = true;
    }

    //this happens only once, when opening fresh inqs
    if (inqObj.inq_adults != null && inqObj.inq_adults != 0) {
        if (inquiry.nationality_id.countryname == "Sri Lanka") {

            document.getElementById('inqLocalAdultCount').value = inqObj.inq_adults || 0;
            inquiry.inq_local_adults = inqObj.inq_adults;
            oldInquiry.inq_local_adults = inqObj.inq_adults;
            inquiry.inq_adults = null;

            document.getElementById('inqLocalChildCount').value = inqObj.inq_kids || 0;
            inquiry.inq_local_kids = inqObj.inq_kids;
            oldInquiry.inq_local_kids = inqObj.inq_kids;
            inquiry.inq_kids = null;

        } else {

            document.getElementById('inqForeignAdultCount').value = inqObj.inq_adults || 0;
            inquiry.inq_foreign_adults = inqObj.inq_adults;
            oldInquiry.inq_foreign_adults = inqObj.inq_adults;
            inquiry.inq_adults = null;

            document.getElementById('inqForeignChildCount').value = inqObj.inq_kids || 0;
            inquiry.inq_foreign_kids = inqObj.inq_kids;
            oldInquiry.inq_foreign_kids = inqObj.inq_kids;
            inquiry.inq_kids = null;

        }
        //if (inqObj.inq_adults == 0)
    } else {
        document.getElementById('inqLocalAdultCount').value = inqObj.inq_local_adults || 0;
        document.getElementById('inqLocalChildCount').value = inqObj.inq_local_kids || 0;
        document.getElementById('inqForeignAdultCount').value = inqObj.inq_foreign_adults || 0;
        document.getElementById('inqForeignChildCount').value = inqObj.inq_foreign_kids || 0;
    }

    if (inqObj.inq_guideneed === true) {
        document.getElementById('guideYes').checked = true;
    } else if (inqObj.inq_guideneed === false) {
        document.getElementById('guideNo').checked = true;
    }

    document.getElementById('inqPlacesPreferences').value = inqObj.inq_vplaces || "N/A";
    document.getElementById('inqAccommodationNote').value = inqObj.inq_accos || "N/A";
    document.getElementById('inqTransportNote').value = inqObj.inq_vehi || "N/A";
    document.getElementById('estdPickupLocation').value = inqObj.inq_pick || "N/A";
    document.getElementById('estdDropOffLocation').value = inqObj.inq_drop || "N/A";
    document.getElementById('inputNoteInquiry').value = inqObj.note || "N/A";
    document.getElementById('inqStatus').value = inqObj.inq_status || "N/A";

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
        'inqAdditionalContact',
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
    if (inqObj.inq_status == "Confirmed" || inqObj.inq_status == "Dropped" || inqObj.deleted_inq == true) {
        enableEditBtn.disabled = true;
        enableEditBtn.style.cursor = "not-allowed";

        addNewResponseRowBtn.disabled = true;
        addNewResponseRowBtn.style.cursor = "not-allowed";
    } else {
        enableEditBtn.disabled = false;
        enableEditBtn.style.cursor = "pointer";

        addNewResponseRowBtn.disabled = false;
        addNewResponseRowBtn.style.cursor = "pointer";
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
        "inqMainEnquiry",
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

    if (inquiry.is_startdate_confirmed !== oldInquiry.is_startdate_confirmed) {
        updates += `Start Date Confirmation changed from ${oldInquiry.is_startdate_confirmed ? "Confirmed" : "Not Confirmed"} to ${inquiry.is_startdate_confirmed ? "Confirmed" : "Not Confirmed"}\n`;
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

        if (inquiry.inq_local_adults !== oldInquiry.inq_local_adults && !(inquiry.inq_local_adults == 0 && oldInquiry.inq_local_adults == 0)) {
            updates += `Traveller Group: Local Adult Count changed from ${oldInquiry.inq_local_adults || 0} to ${inquiry.inq_local_adults}\n`;
        }

        if (inquiry.inq_local_kids !== oldInquiry.inq_local_kids && !(inquiry.inq_local_kids == 0 && oldInquiry.inq_local_kids == 0)) {
            updates += `Traveller Group: Local Child Count changed from ${oldInquiry.inq_local_kids || 0} to ${inquiry.inq_local_kids}\n`;
        }

        if (inquiry.inq_foreign_adults !== oldInquiry.inq_foreign_adults && !(inquiry.inq_foreign_adults == 0 && oldInquiry.inq_foreign_adults == 0)) {
            updates += `Traveller Group: Foreign Adult Count changed from ${oldInquiry.inq_foreign_adults || 0} to ${inquiry.inq_foreign_adults}\n`;
        }

        if (inquiry.inq_foreign_kids !== oldInquiry.inq_foreign_kids && !(inquiry.inq_foreign_kids == 0 && oldInquiry.inq_foreign_kids == 0)) {
            updates += `Traveller Group: Foreign Child Count changed from ${oldInquiry.inq_foreign_kids || 0} to ${inquiry.inq_foreign_kids}\n`;
        }

    }

    //assigned_empid
    if (inquiry.assigned_empid.id != oldInquiry.assigned_empid.id) {
        updates += `Assigned Employee changed from ${oldInquiry.assigned_empid.fullname} to ${inquiry.assigned_empid.fullname}\n`;

    }

    //for status
    if (inquiry.inq_status !== oldInquiry.inq_status) {
        updates += `Internal Note changed from ${oldInquiry.inq_status || "N/A"} to ${inquiry.inq_status || "N/A"}\n`;
    }

    return updates;

}

//refresh the inquiry followup section and reset all fields
const refreshInqFollowupSection = () => {

    followup = new Object();

    document.getElementById('manualResponseAddingSection').innerHTML = '';

    const addNewResponseRowBtn = document.getElementById('createNewResponseRowBtn');
    addNewResponseRowBtn.disabled = false;
    addNewResponseRowBtn.style.cursor = "pointer";

}

//update a manual inq
const updateSystemInq = async () => {

    const errors = checkManualInqErrors();

    if (errors == "") {

        const changesHappened = showInqValueChanges();

        if (changesHappened == "") {

            showAlertModal('war', "No changes detected to update");

        } else {

            let userComment = prompt("Add a short comment to describe this update:\n\n" + changesHappened);

            if (userComment === null || userComment.trim() === "") {
                showAlertModal('inf', "No comment entered. Task cancelled.");
                return;
            }

            let fullContent = `${changesHappened}\n---\nEmployee Comment: ${userComment}`;

            //to remove general traveller grp counts, bcz they are now saved in local/foreign separately
            inquiry.inq_adults = null;
            inquiry.inq_kids = null;

            //to followup
            followup.content = fullContent;
            followup.inquiry_id = inquiry;

            console.log("Follow up object: ", followup);
            try {
                let putServiceResponse = await ajaxPPDRequest("/followupwithinq", "POST", followup);
                if (putServiceResponse === "OK") {
                    showAlertModal('suc', "Successfully Updated");
                    document.getElementById('formSystemInq').reset();
                    refreshInquiryForm();
                    handleTableCreation();
                    refillAllPrevResponses();
                    var followupTab = new bootstrap.Tab(document.getElementById('inqStep4-tab'));
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

//handle adult counts
const validateInquiryAdultCounts = () => {
    const localAdult = document.getElementById('inqLocalAdultCount');
    const foreignAdult = document.getElementById('inqForeignAdultCount');

    const localVal = parseInt(localAdult.value) || 0;
    const foreignVal = parseInt(foreignAdult.value) || 0;

    if (localVal === 0 && foreignVal === 0) {
        localAdult.style.border = "2px solid red";
        foreignAdult.style.border = "2px solid red";
        inquiry.inq_foreign_adults = null;
        inquiry.inq_local_adults = null;
    } else {

        inputValidatorText(localAdult, ' ^([0]|[1-9][0-9]{0,1})$', 'inquiry', 'inq_local_adults');
        inputValidatorText(foreignAdult, ' ^([0]|[1-9][0-9]{0,1})$', 'inquiry', 'inq_foreign_adults');

    }
}


//show all the responses
const refillAllPrevResponses = async () => {

    // /followup/byinqid/{inqId}
    try {
        const prevResponses = await ajaxGetReq("/followup/byinqid/" + inquiry.id);
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

        prevResponses.forEach(res => {
            // Outer column div
            const colDiv = document.createElement("div");
            colDiv.classList.add("col-12", "mb-3");

            // Card box
            const boxDiv = document.createElement("div");
            boxDiv.classList.add("p-3", "rounded", "border", "shadow-sm", "bg-light");

            // Header row (user id + time)
            const headerDiv = document.createElement("div");
            headerDiv.classList.add("d-flex", "justify-content-between", "mb-2");

            const userSpan = document.createElement("small");
            userSpan.classList.add("text-muted");
            userSpan.innerHTML = `<i class="bi bi-person"></i> User ID: ${res.addeduserid}`;

            const timeSpan = document.createElement("small");
            timeSpan.classList.add("text-muted");
            const dateObj = new Date(res.addeddatetime);
            timeSpan.innerHTML = `<i class="bi bi-clock-history"></i> ${dateObj.toLocaleString()}`;

            headerDiv.appendChild(userSpan);
            headerDiv.appendChild(timeSpan);

            // Content (with <pre> to preserve line breaks)
            const contentPre = document.createElement("pre");
            contentPre.classList.add("mb-0");
            contentPre.innerText = res.content;

            // Assemble all
            boxDiv.appendChild(headerDiv);
            boxDiv.appendChild(contentPre);
            colDiv.appendChild(boxDiv);
            container.appendChild(colDiv);
        });


    } catch (error) {
        console.error("Failed to fetch inquiry responses:", error);

    }

}

//re render the template  ✅
const createNewResponseInputSection = async () => {
    document.getElementById("createNewResponseRowBtn").disabled = true;

    const template = document.getElementById("response-input-template");
    const clone = template.content.cloneNode(true);

    document.getElementById("manualResponseAddingSection").appendChild(clone);

    try {
        console.log(inquiry.id);
        const tpkgs = await ajaxGetReq("/tpkg/custom/byinq?inqid=" + inquiry.id);
        fillMultDataIntoDynamicSelects(lastSentTourPackageSelect, 'Please Select Package', tpkgs, 'pkgcode', 'pkgtitle');
    } catch (error) {
        console.error("Failed to fetch tour packages:", error);
    }

}

//check manual followup errors
const checkManualFollowupErrors = () => {
    let errors = "";

    if (followup.content == null || followup.content.trim() === "") {
        errors = errors + " Please Enter The Follow-up Response \n";
    }

    if (followup.followup_status == null) {
        errors = errors + " Please Select The Follow-up Status \n";
    }

    if (followup.followup_status == "quote_sent" && followup.last_sent_tpkg == null) {
        errors = errors + " Please Select The Tour Package Sent \n";
    }

    if (followup.followup_status == "good_to_book" && followup.last_sent_tpkg == null) {
        errors = errors + " Please Select The Tour Package \n";
    }

    return errors;
}

//fn to submit the manual followup
const submitManualFollowup = async () => {

    const errors = checkManualFollowupErrors();
    if (errors == '') {

        let userConfirm = confirm("Are you sure to proceed ?");

        if (userConfirm) {

            followup.inquiry_id = inquiry;

            console.log("Follow up object: ", followup);
            try {
                let postServiceResponse = await ajaxPPDRequest("/followup", "POST", followup);
                if (postServiceResponse === "OK") {
                    showAlertModal('suc', "Successfully Added");

                    //hide followup form section
                    document.getElementById('manualResponseAddingSection').innerHTML = '';

                    //show previous responses list
                    refillAllPrevResponses();

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
const handleStartDateStatusChange = () => {

    const startDateSure = document.getElementById('startDateConfirmed');
    const startDateUncertain = document.getElementById('startDateUnconfirmed');
    const startDateInput = document.getElementById('inqApproxStartDate');

    if (startDateSure.checked) {
        inquiry.is_startdate_confirmed = true;
        startDateInput.style.border = "2px solid lime";

    } else if (startDateUncertain.checked) {
        inquiry.is_startdate_confirmed = false;
        startDateInput.style.border = "2px solid orange";
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