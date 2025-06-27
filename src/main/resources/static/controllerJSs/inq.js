window.addEventListener('load', () => {

    refreshInquiryForm();
    refreshInqFollowupSection();
    handleTableCreation();
    handleDateFields();
    
});

//handle tables type
const handleTableCreation = () => {
    const rolesRaw = document.getElementById('userRolesArraySection').textContent;
    console.log("Raw roles text:", rolesRaw);

    const roles = JSON.parse(rolesRaw);
    console.log("Parsed roles:", roles);

    if (roles.includes("System_Admin") || roles.includes("Manager")) {
        buildAllInqTable();
    } else {
        console.log("else running");
        buildPersonalInqTable();
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

//global var to store id of the table
let sharedTableIdMainTbl = "mainTableInquiry";
let sharedTableIdPersonalTbl = "personalTableInquiry";

//this table will show all the inquiries,all statuses, all assigned users
const buildAllInqTable = async () => {

    try {
        const allInqs = await ajaxGetReq("/inq/all");

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'inqcode', colHeadName: 'Code' },
            { displayType: 'text', displayingPropertyOrFn: 'inqsrc', colHeadName: 'Source' },
            { displayType: 'function', displayingPropertyOrFn: showRecievedTimeStamp, colHeadName: 'Recieved Time' },
            { displayType: 'text', displayingPropertyOrFn: 'inq_status', colHeadName: 'Status' }
        ]

        createTable(tableHolderDiv, sharedTableIdMainTbl, allInqs, tableColumnInfo);

        $(`#${sharedTableIdMainTbl}`).dataTable();

    } catch (error) {
        console.error("Failed to build main inq table:", error);
    }
}

//this table will show all the assigned inquiries of the user
const buildPersonalInqTable = async () => {

    const userId = document.getElementById('loggedUserIdSectionId').textContent;
    console.log(userId);

    try {
        const assignedInqs = await ajaxGetReq("/inq/personal?userid=" + userId);

        const tableColumnInfo = [
            { displayType: 'text', displayingPropertyOrFn: 'inqcode', colHeadName: 'Code' },
            { displayType: 'text', displayingPropertyOrFn: 'inqsrc', colHeadName: 'Source' },
            { displayType: 'function', displayingPropertyOrFn: showRecievedTimeStamp, colHeadName: 'Recieved Time' },
            { displayType: 'text', displayingPropertyOrFn: 'inq_status', colHeadName: 'Status' }
        ]

        createTable(tableHolderDiv, sharedTableIdPersonalTbl, assignedInqs, tableColumnInfo);

        $(`#${sharedTableIdPersonalTbl}`).dataTable();

    } catch (error) {
        console.error("Failed to build personal inq table:", error);
    }
}

//show time stamp on table
const showRecievedTimeStamp = (ob) => {
    return ob.recieveddate + "</br>" + (ob.recievedtime ? ob.recievedtime : "12:00")
}

//refresh the inquiry form and reset all fields
const refreshInquiryForm = async () => {

    inquiry = new Object();

    try {
        const intrstdPkgList = await ajaxGetReq('/tourpackageforweb/all');
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

    const updateBtn = document.getElementById('manualInqUpdateBtn');
    updateBtn.disabled = true;
    updateBtn.style.cursor = "not-allowed";

    // Array of input field IDs to reset
    const inputTagsIds = [
        'inqRecievedMethod',
        'inqRecievedDate',
        'inqRecievedTime',
        'inqCodeRecievedContact',
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
    ];

    //clear out any previous styles
    inputTagsIds.forEach((fieldID) => {
        const field = document.getElementById(fieldID);
        if (field) {
            field.style.border = "1px solid #ced4da";
            field.value = '';
        }
    });

}

//refresh the inquiry followup section and reset all fields
const refreshInqFollowupSection = () => {

    //    const inqFollowupInputTagsIds = [
    //        'inqFollowupDate',
    //        'inqFollowupTime',
    //        'inqFollowupNote',
    //        'inqFollowupStatus',
    //    ];
    //
    //    inqFollowupInputTagsIds.forEach((fieldID) => {
    //        const field = document.getElementById(fieldID);
    //        if (field) {
    //            field.style.border = "1px solid #ced4da";
    //            field.value = '';
    //        }
    //    });

    const addNewResponseRowBtn = document.getElementById('createNewResponseRowBtn');
    addNewResponseRowBtn.disabled = true;
    addNewResponseRowBtn.style.cursor = "not-allowed";

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

    // if (inquiry.recievedmethod == "Phone Call" && inquiry.recievedcontactoremail == null) {
    //     errors = errors + " Please Enter The Source Phone Number \n";
    // }

    // if (inquiry.recievedmethod == "Email" && inquiry.recievedcontactoremail == null) {
    //     errors = errors + " Please Enter The Source Email Address \n";
    // }

    if (inquiry.recieveddate == null) {
        errors = errors + " Please Enter The Inquiry Recieved Date  \n";
    }

    // if (inquiry.recievedtime == null) {
    //     errors = errors + " Please Enter The Inquiry Recieved Time  \n";
    // }

    if (inquiry.main_inq_msg == null) {
        errors = errors + " Please Enter The Main Enquiry Details  \n";
    }

    if (inquiry.clientname == null) {
        errors = errors + " Please Enter The Client's Name  \n";
    }

    //if (inquiry.nationality == null) {
    //    errors = errors + " Please Select The Client's Nationality  \n";
    //}

    if (inquiry.contactnum == null && inquiry.email == null) {
        errors = errors + " Please Enter At Least One Contact Method (Phone or Email)  \n";
    }

    if (inquiry.prefcontactmethod == null) {
        errors = errors + " Please Select The Client's Preferred Contact Method  \n";
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
                // Await the response from the AJAX request
                const postServerResponse = await ajaxPPDRequest("/inq", "POST", inquiry);

                if (postServerResponse === 'OK') {
                    showAlertModal('suc', 'Saved Successfully');
                    document.getElementById('formSystemInq').reset();
                    refreshInquiryForm();
                    //buildEmployeeTable();
                    //var myEmpTableTab = new bootstrap.Tab(document.getElementById('table-tab'));
                    //myEmpTableTab.show();
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